import { describe, expect, it } from 'vitest';
import { presetAppliesToCollection } from './presetCollection';

describe('presetAppliesToCollection', () => {
  it('treats a generic single-collection preset (no embedded collection) as applicable anywhere', () => {
    const value = { query_by: 'name', per_page: 20 };
    expect(presetAppliesToCollection(value, 'companies')).toBe(true);
    expect(presetAppliesToCollection(value, 'airbnb_listings')).toBe(true);
  });

  it('scopes a single-collection preset that pins a collection', () => {
    const value = { collection: 'airbnb_listings', query_by: 'address.state' };
    expect(presetAppliesToCollection(value, 'airbnb_listings')).toBe(true);
    expect(presetAppliesToCollection(value, 'companies')).toBe(false);
  });

  it('rejects a multi-search preset whose searches target another collection', () => {
    // This is the reported bug: an airbnb multi-search preset hijacking the
    // companies search.
    const value = {
      searches: [
        { collection: 'airbnb_listings', q: '*', query_by: 'address.state' },
      ],
    };
    expect(presetAppliesToCollection(value, 'companies')).toBe(false);
  });

  it('accepts a multi-search preset if any search targets this collection', () => {
    const value = {
      searches: [
        { collection: 'airbnb_listings', q: '*' },
        { collection: 'companies', q: '*' },
      ],
    };
    expect(presetAppliesToCollection(value, 'companies')).toBe(true);
    expect(presetAppliesToCollection(value, 'airbnb_listings')).toBe(true);
    expect(presetAppliesToCollection(value, 'products')).toBe(false);
  });

  it('treats an empty/whitespace embedded collection as generic (applies anywhere)', () => {
    expect(presetAppliesToCollection({ collection: '' }, 'companies')).toBe(
      true,
    );
  });

  it('does not throw on malformed values and defaults to applicable', () => {
    expect(presetAppliesToCollection(null, 'companies')).toBe(true);
    expect(presetAppliesToCollection(undefined, 'companies')).toBe(true);
    expect(presetAppliesToCollection('preset-string', 'companies')).toBe(true);
    expect(presetAppliesToCollection({ searches: 'oops' }, 'companies')).toBe(
      true,
    );
    expect(
      presetAppliesToCollection({ searches: [null, 5] }, 'companies'),
    ).toBe(false);
  });
});
