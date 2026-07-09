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
import {
  useCreateAnalyticsEvent,
  useRecentAnalyticsEvents,
} from './useAnalyticsEvents';

beforeEach(() => {
  setStoreCreds();
});
afterEach(() => {
  resetTestState();
  vi.restoreAllMocks();
});

describe('useCreateAnalyticsEvent', () => {
  it('posts the event body to /analytics/events', async () => {
    let body: unknown = null;
    server.use(
      http.post(`${TS_BASE}/analytics/events`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ok: true });
      })
    );

    const { result } = renderHookWithProviders(() => useCreateAnalyticsEvent());

    await result.current.mutateAsync({
      name: 'products_click_event',
      type: 'click',
      data: { doc_id: '42', user_id: 'u1', q: 'shoes' },
    });

    expect(body).toEqual({
      type: 'click',
      name: 'products_click_event',
      data: { doc_id: '42', user_id: 'u1', q: 'shoes' },
    });
  });

  it('surfaces an error when the server rejects the event', async () => {
    server.use(
      http.post(`${TS_BASE}/analytics/events`, () =>
        HttpResponse.json(
          { message: 'Analytics is not enabled' },
          { status: 400 }
        )
      )
    );

    const { result } = renderHookWithProviders(() => useCreateAnalyticsEvent());

    await expect(
      result.current.mutateAsync({ name: 'x', type: 'click', data: {} })
    ).rejects.toBeTruthy();
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useRecentAnalyticsEvents', () => {
  it('stays idle until params are provided', () => {
    const { result } = renderHookWithProviders(() =>
      useRecentAnalyticsEvents(null)
    );
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches recent events with user_id, name and n', async () => {
    let params: URLSearchParams | null = null;
    const events = [
      {
        name: 'products_click_event',
        event_type: 'click',
        collection: 'products',
        timestamp: 1781299512562470,
        user_id: 'u1',
        doc_id: '42',
      },
    ];
    server.use(
      http.get(`${TS_BASE}/analytics/events`, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ events });
      })
    );

    const { result } = renderHookWithProviders(() =>
      useRecentAnalyticsEvents({
        userId: 'u1',
        name: 'products_click_event',
        n: 10,
      })
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.events).toHaveLength(1);
    expect(params!.get('user_id')).toBe('u1');
    expect(params!.get('name')).toBe('products_click_event');
    expect(params!.get('n')).toBe('10');
  });
});
