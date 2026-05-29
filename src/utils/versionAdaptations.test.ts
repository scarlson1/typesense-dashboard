import type { AnalyticsRuleCreateSchemaV1 } from 'typesense/lib/Typesense/AnalyticsRuleV1';
import { describe, expect, it } from 'vitest';
import { toAnalyticsRulePayloads } from './versionAdaptations';

const makeSchema = (
  overrides: Partial<AnalyticsRuleCreateSchemaV1['params']> = {}
): AnalyticsRuleCreateSchemaV1 =>
  ({
    type: 'popular_queries',
    params: {
      source: { collections: ['products'] },
      destination: { collection: 'product_queries' },
      limit: 1000,
      expand_query: false,
      enable_auto_aggregation: true,
      ...overrides,
    },
  }) as unknown as AnalyticsRuleCreateSchemaV1;

describe('toAnalyticsRulePayloads', () => {
  describe('v29 (is30Plus = false)', () => {
    it('returns the original schema untouched, wrapped in an array', () => {
      const schema = makeSchema();
      const result = toAnalyticsRulePayloads({
        name: 'popular_products',
        schema,
        is30Plus: false,
      });

      expect(result).toEqual([schema]);
      expect(result[0]).toBe(schema);
    });
  });

  describe('v30 (is30Plus = true)', () => {
    it('uses the rule name directly for a single source collection', () => {
      const result = toAnalyticsRulePayloads({
        name: 'popular_products',
        schema: makeSchema({ source: { collections: ['products'] } }),
        is30Plus: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'popular_products',
        collection: 'products',
        type: 'popular_queries',
        event_type: 'search',
        rule_tag: 'popular_products',
      });
    });

    it('suffixes the collection name when there are multiple source collections', () => {
      const result = toAnalyticsRulePayloads({
        name: 'popular',
        schema: makeSchema({ source: { collections: ['products', 'brands'] } }),
        is30Plus: true,
      }) as Array<{ name: string; collection: string }>;

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual([
        'popular_products',
        'popular_brands',
      ]);
      expect(result.map((r) => r.collection)).toEqual(['products', 'brands']);
    });

    it('maps params and copies the destination collection onto each payload', () => {
      const [payload] = toAnalyticsRulePayloads({
        name: 'popular',
        schema: makeSchema({
          limit: 50,
          expand_query: true,
          destination: { collection: 'queries' },
        }),
        is30Plus: true,
      }) as Array<{ params: Record<string, unknown> }>;

      expect(payload.params).toEqual({
        destination_collection: 'queries',
        limit: 50,
        expand_query: true,
        capture_search_requests: true,
      });
    });

    it('defaults capture_search_requests to true when enable_auto_aggregation is undefined', () => {
      const [payload] = toAnalyticsRulePayloads({
        name: 'popular',
        schema: makeSchema({ enable_auto_aggregation: undefined }),
        is30Plus: true,
      }) as Array<{ params: { capture_search_requests: boolean } }>;

      expect(payload.params.capture_search_requests).toBe(true);
    });

    it('preserves an explicit enable_auto_aggregation = false', () => {
      const [payload] = toAnalyticsRulePayloads({
        name: 'popular',
        schema: makeSchema({ enable_auto_aggregation: false }),
        is30Plus: true,
      }) as Array<{ params: { capture_search_requests: boolean } }>;

      expect(payload.params.capture_search_requests).toBe(false);
    });

    it('sets destination_collection to undefined when no destination is provided', () => {
      const schema = makeSchema();
      delete (schema.params as { destination?: unknown }).destination;

      const [payload] = toAnalyticsRulePayloads({
        name: 'popular',
        schema,
        is30Plus: true,
      }) as Array<{ params: { destination_collection: unknown } }>;

      expect(payload.params.destination_collection).toBeUndefined();
    });
  });
});
