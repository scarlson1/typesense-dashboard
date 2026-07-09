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
import { useUpdateByQuery } from './useUpdateByQuery';

let clusterKey = '';
beforeEach(() => {
  clusterKey = setStoreCreds();
});
afterEach(() => {
  resetTestState();
  vi.restoreAllMocks();
});

describe('useUpdateByQuery', () => {
  it('patches matching documents and invalidates the collection query', async () => {
    let requestedFilter: string | null = null;
    let requestBody: unknown = null;
    server.use(
      http.patch(`${TS_BASE}/collections/products/documents`, async ({ request }) => {
        requestedFilter = new URL(request.url).searchParams.get('filter_by');
        requestBody = await request.json();
        return HttpResponse.json({ num_updated: 3 });
      })
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useUpdateByQuery());

    const data = await result.current.mutateAsync({
      collectionId: 'products',
      document: { on_sale: true },
      filterBy: 'category:shoes',
    });

    expect(data).toMatchObject({ num_updated: 3 });
    expect(requestedFilter).toBe('category:shoes');
    expect(requestBody).toEqual({ on_sale: true });
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: collectionQueryKeys.collection(clusterKey, 'products'),
      })
    );
  });

  it('surfaces an error when the update fails', async () => {
    server.use(
      http.patch(`${TS_BASE}/collections/products/documents`, () =>
        HttpResponse.json({ message: 'Bad filter' }, { status: 400 })
      )
    );

    const { result } = renderHookWithProviders(() => useUpdateByQuery());

    await expect(
      result.current.mutateAsync({
        collectionId: 'products',
        document: { on_sale: true },
        filterBy: 'bogus',
      })
    ).rejects.toBeTruthy();
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
