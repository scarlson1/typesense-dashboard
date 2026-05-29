import { collectionQueryKeys } from '@/constants';
import { server } from '@/test/server';
import {
  queryClient,
  renderHookWithProviders,
  resetTestState,
  setStoreCreds,
  TS_BASE,
} from '@/test/utils';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeleteDocument } from './useDeleteDocument';

let clusterKey = '';
beforeEach(() => {
  clusterKey = setStoreCreds();
});
afterEach(() => {
  resetTestState();
  vi.restoreAllMocks();
});

describe('useDeleteDocument', () => {
  it('deletes the document and invalidates the collection query on success', async () => {
    server.use(
      http.delete(`${TS_BASE}/collections/products/documents/abc`, () =>
        HttpResponse.json({ id: 'abc', title: 'gone' })
      )
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useDeleteDocument());

    const data = await result.current.mutateAsync({
      collectionId: 'products',
      docId: 'abc',
    });

    expect(data).toMatchObject({ id: 'abc' });
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: collectionQueryKeys.collection(clusterKey, 'products'),
      })
    );
  });

  it('surfaces an error and still invalidates when the delete fails', async () => {
    server.use(
      http.delete(`${TS_BASE}/collections/products/documents/missing`, () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 })
      )
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useDeleteDocument());

    await expect(
      result.current.mutateAsync({ collectionId: 'products', docId: 'missing' })
    ).rejects.toBeTruthy();

    // onSettled fires on error too, so the collection is still invalidated.
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());
    expect(result.current.isError).toBe(true);
  });
});
