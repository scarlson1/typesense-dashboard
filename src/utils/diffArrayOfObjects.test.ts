import { describe, expect, it } from 'vitest';
import { diffArraysOfObjects } from './diffArrayOfObjects';

interface Field {
  name: string;
  type: string;
  facet?: boolean;
}

describe('diffArraysOfObjects', () => {
  it('returns empty buckets when arrays are identical', () => {
    const arr: Field[] = [{ name: 'title', type: 'string' }];
    expect(diffArraysOfObjects(arr, arr, 'name')).toEqual({
      added: [],
      removed: [],
      updated: [],
    });
  });

  it('detects added objects (present in new, absent in initial)', () => {
    const initial: Field[] = [{ name: 'title', type: 'string' }];
    const next: Field[] = [
      { name: 'title', type: 'string' },
      { name: 'price', type: 'float' },
    ];

    const diff = diffArraysOfObjects(initial, next, 'name');
    expect(diff.added).toEqual([{ name: 'price', type: 'float' }]);
    expect(diff.removed).toEqual([]);
    expect(diff.updated).toEqual([]);
  });

  it('detects removed objects (present in initial, absent in new)', () => {
    const initial: Field[] = [
      { name: 'title', type: 'string' },
      { name: 'price', type: 'float' },
    ];
    const next: Field[] = [{ name: 'title', type: 'string' }];

    const diff = diffArraysOfObjects(initial, next, 'name');
    expect(diff.removed).toEqual([{ name: 'price', type: 'float' }]);
    expect(diff.added).toEqual([]);
    expect(diff.updated).toEqual([]);
  });

  it('detects updated objects and returns the NEW version', () => {
    const initial: Field[] = [{ name: 'price', type: 'float' }];
    const next: Field[] = [{ name: 'price', type: 'float', facet: true }];

    const diff = diffArraysOfObjects(initial, next, 'name');
    expect(diff.updated).toEqual([{ name: 'price', type: 'float', facet: true }]);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
  });

  it('handles a mix of added, removed, and updated in one pass', () => {
    const initial: Field[] = [
      { name: 'title', type: 'string' },
      { name: 'price', type: 'float' },
      { name: 'legacy', type: 'string' },
    ];
    const next: Field[] = [
      { name: 'title', type: 'string' }, // unchanged
      { name: 'price', type: 'int32' }, // updated
      { name: 'rating', type: 'float' }, // added
    ];

    const diff = diffArraysOfObjects(initial, next, 'name');
    expect(diff.added).toEqual([{ name: 'rating', type: 'float' }]);
    expect(diff.removed).toEqual([{ name: 'legacy', type: 'string' }]);
    expect(diff.updated).toEqual([{ name: 'price', type: 'int32' }]);
  });

  it('treats key-order-only differences as an update (JSON.stringify is order sensitive)', () => {
    // Documents a sharp edge: same data, different key order, is flagged updated.
    const initial = [{ name: 'x', a: 1, b: 2 }];
    const next = [{ name: 'x', b: 2, a: 1 }];

    const diff = diffArraysOfObjects(initial, next, 'name');
    expect(diff.updated).toEqual([{ name: 'x', b: 2, a: 1 }]);
  });
});
