/**
 * Whether a Typesense preset's stored `value` can be applied to a
 * single-collection search against `collectionId`.
 *
 * Typesense presets are cluster-global, not collection-scoped, so a preset
 * created for another collection can leak into the wrong search (via a
 * per-collection localStorage key or an auto-default). The danger is concrete:
 * a preset whose value embeds a `collection` overrides the collection in the
 * search URL, so applying an `airbnb_listings` preset while viewing `companies`
 * makes the search return airbnb documents.
 *
 * Rules:
 *  - multi-search preset (`{ searches: [...] }`): applies only if one of its
 *    searches targets this collection.
 *  - single-collection preset that pins a `collection`: applies only if it
 *    matches.
 *  - generic single-collection preset (no embedded collection): applies
 *    anywhere — this preserves the cluster-global nature of plain presets.
 */
export const presetAppliesToCollection = (
  value: unknown,
  collectionId: string,
): boolean => {
  if (!value || typeof value !== 'object') return true;
  const v = value as { collection?: unknown; searches?: unknown };
  if (Array.isArray(v.searches)) {
    return v.searches.some(
      (s) =>
        !!s &&
        typeof s === 'object' &&
        (s as { collection?: unknown }).collection === collectionId,
    );
  }
  if (typeof v.collection === 'string' && v.collection.length > 0) {
    return v.collection === collectionId;
  }
  return true;
};
