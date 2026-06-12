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
import { useDeleteByQuery } from './useDeleteByQuery';

let clusterKey = '';
beforeEach(() => {
  clusterKey = setStoreCreds();
});
afterEach(() => {
  resetTestState();
  vi.restoreAllMocks();
});

describe('useDeleteByQuery', () => {
  it('deletes matching documents and invalidates collection + schema keys', async () => {
    let requestedFilter: string | null = null;
    server.use(
      http.delete(`${TS_BASE}/collections/products/documents`, ({ request }) => {
        requestedFilter = new URL(request.url).searchParams.get('filter_by');
        return HttpResponse.json({ num_deleted: 5 });
      })
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useDeleteByQuery());

    const data = await result.current.mutateAsync({
      collectionId: 'products',
      filterBy: 'in_stock:false',
    });

    expect(data).toMatchObject({ num_deleted: 5 });
    expect(requestedFilter).toBe('in_stock:false');
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: collectionQueryKeys.collection(clusterKey, 'products'),
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.schema(clusterKey, 'products'),
    });
  });

  it('surfaces an error and still invalidates when the delete fails', async () => {
    server.use(
      http.delete(`${TS_BASE}/collections/products/documents`, () =>
        HttpResponse.json({ message: 'Bad filter' }, { status: 400 })
      )
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useDeleteByQuery());

    await expect(
      result.current.mutateAsync({
        collectionId: 'products',
        filterBy: 'bogus',
      })
    ).rejects.toBeTruthy();

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());
    expect(result.current.isError).toBe(true);
  });
});
