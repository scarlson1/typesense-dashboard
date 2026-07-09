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
import { useTruncateCollection } from './useTruncateCollection';

let clusterKey = '';
beforeEach(() => {
  clusterKey = setStoreCreds();
});
afterEach(() => {
  resetTestState();
  vi.restoreAllMocks();
});

describe('useTruncateCollection', () => {
  it('sends truncate=true and invalidates collection + schema keys', async () => {
    let truncateParam: string | null = null;
    server.use(
      http.delete(`${TS_BASE}/collections/products/documents`, ({ request }) => {
        truncateParam = new URL(request.url).searchParams.get('truncate');
        return HttpResponse.json({ num_deleted: 120 });
      })
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useTruncateCollection());

    const data = await result.current.mutateAsync('products');

    expect(data).toMatchObject({ num_deleted: 120 });
    expect(truncateParam).toBe('true');
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: collectionQueryKeys.collection(clusterKey, 'products'),
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: collectionQueryKeys.schema(clusterKey, 'products'),
    });
  });

  it('surfaces an error when truncation fails', async () => {
    server.use(
      http.delete(`${TS_BASE}/collections/missing/documents`, () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 })
      )
    );

    const { result } = renderHookWithProviders(() => useTruncateCollection());

    await expect(result.current.mutateAsync('missing')).rejects.toBeTruthy();
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
