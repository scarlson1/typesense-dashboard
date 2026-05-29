import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import { describe, expect, it } from 'vitest';
import { getCollectionUpdates } from './getCollectionUpdates';

type Fields = CollectionSchema['fields'];

const field = (name: string, extra: Record<string, unknown> = {}) =>
  ({ name, type: 'string', ...extra }) as Fields[number];

describe('getCollectionUpdates', () => {
  it('returns no updates when fields are unchanged', () => {
    const fields = [field('title')];
    expect(getCollectionUpdates(fields, fields)).toEqual([]);
  });

  it('emits a drop entry for removed fields', () => {
    const initial = [field('title'), field('legacy')];
    const next = [field('title')];

    expect(getCollectionUpdates(initial, next)).toEqual([
      { name: 'legacy', drop: true },
    ]);
  });

  it('emits the added field as-is', () => {
    const initial = [field('title')];
    const next = [field('title'), field('price', { type: 'float' })];

    expect(getCollectionUpdates(initial, next)).toEqual([
      { name: 'price', type: 'float' },
    ]);
  });

  it('emits a drop followed by the new definition for updated fields', () => {
    const initial = [field('price', { type: 'float' })];
    const next = [field('price', { type: 'int32' })];

    // Typesense requires dropping a field before re-adding it with a new type.
    expect(getCollectionUpdates(initial, next)).toEqual([
      { name: 'price', drop: true },
      { name: 'price', type: 'int32' },
    ]);
  });

  it('orders updates as removed, then updated (drop+add), then added', () => {
    const initial = [
      field('title'),
      field('price', { type: 'float' }),
      field('legacy'),
    ];
    const next = [
      field('title'),
      field('price', { type: 'int32' }),
      field('rating', { type: 'float' }),
    ];

    expect(getCollectionUpdates(initial, next)).toEqual([
      { name: 'legacy', drop: true },
      { name: 'price', drop: true },
      { name: 'price', type: 'int32' },
      { name: 'rating', type: 'float' },
    ]);
  });
});
