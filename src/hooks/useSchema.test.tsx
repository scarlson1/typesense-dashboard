import { server } from '@/test/server';
import {
  renderHookWithProviders,
  resetTestState,
  setStoreCreds,
  TS_BASE,
} from '@/test/utils';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSchema } from './useSchema';

const schema = {
  name: 'products',
  num_documents: 42,
  fields: [
    { name: 'title', type: 'string' },
    { name: 'price', type: 'float' },
  ],
  default_sorting_field: 'price',
  created_at: 1700000000,
};

beforeEach(() => setStoreCreds());
afterEach(resetTestState);

describe('useSchema', () => {
  it('fetches and returns a collection schema for the active cluster', async () => {
    server.use(
      http.get(`${TS_BASE}/collections/products`, () => HttpResponse.json(schema))
    );

    const { result } = renderHookWithProviders(() => useSchema('products'));

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toMatchObject({
      name: 'products',
      num_documents: 42,
    });
  });

  it('requests the collection named by the argument', async () => {
    let requestedUrl = '';
    server.use(
      http.get(`${TS_BASE}/collections/:name`, ({ request, params }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ ...schema, name: params.name as string });
      })
    );

    const { result } = renderHookWithProviders(() => useSchema('orders'));

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(requestedUrl).toContain('/collections/orders');
    expect(result.current.data?.name).toBe('orders');
  });
});
