import { describe, expect, it } from 'vitest';
import { getObjectDiff } from './getObjectDiff';

// getObjectDiff requires both arguments to share a type; for cases where the
// two objects have intentionally different shapes (add/remove keys) we widen
// the type parameter to a permissive record.
type AnyRecord = Record<string, unknown>;

describe('getObjectDiff', () => {
  it('returns an empty object for identical inputs', () => {
    expect(getObjectDiff({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toEqual({});
  });

  it('reports changed primitive values using the new value', () => {
    expect(getObjectDiff({ age: 30 }, { age: 31 })).toEqual({ age: 31 });
  });

  it('reports added properties', () => {
    expect(
      getObjectDiff<AnyRecord>({ name: 'Alice' }, { name: 'Alice', country: 'USA' })
    ).toEqual({ country: 'USA' });
  });

  it('marks removed properties as undefined', () => {
    expect(
      getObjectDiff<AnyRecord>({ name: 'Alice', city: 'NY' }, { name: 'Alice' })
    ).toEqual({ city: undefined });
  });

  it('handles the documented example (change + remove + add)', () => {
    const a: AnyRecord = { name: 'Alice', age: 30, city: 'New York' };
    const b: AnyRecord = { name: 'Alice', age: 31, country: 'USA' };

    expect(getObjectDiff(a, b)).toEqual({
      age: 31,
      city: undefined,
      country: 'USA',
    });
  });

  it('recurses into nested objects and returns only the nested diff', () => {
    const a = { meta: { a: 1, b: 2 } };
    const b = { meta: { a: 1, b: 3 } };

    expect(getObjectDiff(a, b)).toEqual({ meta: { b: 3 } });
  });

  it('omits nested objects whose contents are unchanged', () => {
    const a = { meta: { a: 1 }, x: 1 };
    const b = { meta: { a: 1 }, x: 2 };

    // Note: nested objects compare by reference first; equal-by-value but
    // distinct objects recurse and yield an empty nested diff, so `meta` is
    // omitted entirely.
    expect(getObjectDiff(a, b)).toEqual({ x: 2 });
  });
});
