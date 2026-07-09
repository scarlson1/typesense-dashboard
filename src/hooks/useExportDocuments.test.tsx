import { server } from '@/test/server';
import {
  renderHookWithProviders,
  resetTestState,
  setStoreCreds,
  TS_BASE,
} from '@/test/utils';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExportDocuments } from './useExportDocuments';

const JSONL = '{"id":"1","title":"a"}\n{"id":"2","title":"b"}';

beforeEach(() => {
  setStoreCreds();
});
afterEach(() => {
  resetTestState();
  vi.restoreAllMocks();
});

describe('useExportDocuments', () => {
  it('returns the JSONL string and forwards export parameters', async () => {
    let params: URLSearchParams | null = null;
    server.use(
      http.get(
        `${TS_BASE}/collections/products/documents/export`,
        ({ request }) => {
          params = new URL(request.url).searchParams;
          return HttpResponse.text(JSONL);
        }
      )
    );

    const { result } = renderHookWithProviders(() => useExportDocuments());

    const data = await result.current.mutateAsync({
      collectionId: 'products',
      options: { filter_by: 'in_stock:true', include_fields: 'id,title' },
    });

    expect(data).toBe(JSONL);
    expect(params!.get('filter_by')).toBe('in_stock:true');
    expect(params!.get('include_fields')).toBe('id,title');
  });

  it('surfaces an error when the export fails', async () => {
    server.use(
      http.get(`${TS_BASE}/collections/missing/documents/export`, () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 })
      )
    );

    const { result } = renderHookWithProviders(() => useExportDocuments());

    await expect(
      result.current.mutateAsync({ collectionId: 'missing' })
    ).rejects.toBeTruthy();
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
