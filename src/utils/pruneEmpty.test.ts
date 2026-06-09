import { describe, expect, it } from 'vitest';
import { pruneEmpty } from './index';

describe('pruneEmpty', () => {
  it('drops undefined, null, and empty-string values', () => {
    expect(
      pruneEmpty({ a: 'x', b: '', c: undefined, d: null, e: 'y' }),
    ).toEqual({ a: 'x', e: 'y' });
  });

  it('preserves falsy-but-meaningful values (0, false)', () => {
    expect(pruneEmpty({ temperature: 0, capture: false, name: '' })).toEqual({
      temperature: 0,
      capture: false,
    });
  });

  it('returns an empty object when everything is blank', () => {
    expect(pruneEmpty({ a: '', b: undefined, c: null })).toEqual({});
  });
});
