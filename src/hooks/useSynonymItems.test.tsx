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
import type { SynonymSetSchema } from 'typesense/lib/Typesense/SynonymSets';
import { useDeleteSynonymItem, useUpsertSynonymItem } from './useSynonymItems';

let clusterKey = '';
beforeEach(() => {
  clusterKey = setStoreCreds();
});
afterEach(() => {
  resetTestState();
  vi.restoreAllMocks();
});

/** A migrated v29 set: several rules living under one set name. */
const migratedSet: SynonymSetSchema = {
  name: 'products_synonyms',
  items: [
    { id: 'apt', synonyms: ['apartment', 'flat', 'condo'] },
    { id: 'shoe', synonyms: ['shoe', 'sneaker'] },
  ],
};

describe('useUpsertSynonymItem', () => {
  it('writes a single item and never replaces the whole set', async () => {
    const setPuts: unknown[] = [];
    let itemBody: unknown = null;

    server.use(
      http.get(`${TS_BASE}/synonym_sets/products_synonyms`, () =>
        HttpResponse.json(migratedSet),
      ),
      http.put(`${TS_BASE}/synonym_sets/products_synonyms`, async ({ request }) => {
        setPuts.push(await request.json());
        return HttpResponse.json({ items: [] });
      }),
      http.put(
        `${TS_BASE}/synonym_sets/products_synonyms/items/apt`,
        async ({ request }) => {
          itemBody = await request.json();
          return HttpResponse.json({ id: 'apt', ...(itemBody as object) });
        },
      ),
    );

    const { result } = renderHookWithProviders(() => useUpsertSynonymItem());

    await result.current.mutateAsync({
      setName: 'products_synonyms',
      itemId: 'apt',
      item: { synonyms: ['apartment', 'flat', 'condo', 'unit'] },
    });

    // The set-level PUT would have dropped the sibling `shoe` rule.
    expect(setPuts).toEqual([]);
    expect(itemBody).toEqual({
      synonyms: ['apartment', 'flat', 'condo', 'unit'],
    });
  });

  it('creates the set container first when the set does not exist yet', async () => {
    const calls: string[] = [];

    server.use(
      http.get(`${TS_BASE}/synonym_sets/brand_new`, () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 }),
      ),
      http.put(`${TS_BASE}/synonym_sets/brand_new`, async ({ request }) => {
        calls.push('set');
        return HttpResponse.json(await request.json());
      }),
      http.put(`${TS_BASE}/synonym_sets/brand_new/items/apt`, () => {
        calls.push('item');
        return HttpResponse.json({ id: 'apt', synonyms: ['a', 'b'] });
      }),
    );

    const { result } = renderHookWithProviders(() => useUpsertSynonymItem());

    await result.current.mutateAsync({
      setName: 'brand_new',
      itemId: 'apt',
      item: { synonyms: ['a', 'b'] },
    });

    expect(calls).toEqual(['set', 'item']);
  });

  it('invalidates the synonym sets key', async () => {
    server.use(
      http.get(`${TS_BASE}/synonym_sets/products_synonyms`, () =>
        HttpResponse.json(migratedSet),
      ),
      http.put(`${TS_BASE}/synonym_sets/products_synonyms/items/apt`, () =>
        HttpResponse.json({ id: 'apt', synonyms: ['a'] }),
      ),
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithProviders(() => useUpsertSynonymItem());
    await result.current.mutateAsync({
      setName: 'products_synonyms',
      itemId: 'apt',
      item: { synonyms: ['a'] },
    });

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: collectionQueryKeys.synonymSets(clusterKey),
      }),
    );
  });
});

describe('useDeleteSynonymItem', () => {
  it('deletes only the targeted item, leaving its siblings in place', async () => {
    let deletedPath: string | null = null;
    server.use(
      http.delete(
        `${TS_BASE}/synonym_sets/products_synonyms/items/apt`,
        ({ request }) => {
          deletedPath = new URL(request.url).pathname;
          return HttpResponse.json({ id: 'apt' });
        },
      ),
    );

    queryClient.setQueryData(collectionQueryKeys.synonymSets(clusterKey), [
      migratedSet,
    ]);

    const { result } = renderHookWithProviders(() => useDeleteSynonymItem());

    await result.current.mutateAsync({
      setName: 'products_synonyms',
      itemId: 'apt',
    });

    expect(deletedPath).toBe('/synonym_sets/products_synonyms/items/apt');

    // Optimistic cache keeps the set (and the sibling rule) around.
    const cached = queryClient.getQueryData<SynonymSetSchema[]>(
      collectionQueryKeys.synonymSets(clusterKey),
    );
    expect(cached).toHaveLength(1);
    expect(cached?.[0].items.map((i) => i.id)).toEqual(['shoe']);
  });

  it('rolls the cache back when the delete fails', async () => {
    server.use(
      http.delete(`${TS_BASE}/synonym_sets/products_synonyms/items/apt`, () =>
        HttpResponse.json({ message: 'nope' }, { status: 500 }),
      ),
    );

    queryClient.setQueryData(collectionQueryKeys.synonymSets(clusterKey), [
      migratedSet,
    ]);

    const { result } = renderHookWithProviders(() => useDeleteSynonymItem());

    await expect(
      result.current.mutateAsync({
        setName: 'products_synonyms',
        itemId: 'apt',
      }),
    ).rejects.toBeTruthy();

    const cached = queryClient.getQueryData<SynonymSetSchema[]>(
      collectionQueryKeys.synonymSets(clusterKey),
    );
    expect(cached?.[0].items.map((i) => i.id)).toEqual(['apt', 'shoe']);
  });
});
