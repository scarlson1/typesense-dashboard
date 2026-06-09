import { describe, expect, it } from 'vitest';
import { buildSearchModeParams } from './searchModeParams';

const textQueryBy = ['name', 'description'];

describe('buildSearchModeParams', () => {
  it('keyword: query_by over text fields, no vector/nl params', () => {
    expect(
      buildSearchModeParams({ mode: 'keyword', textQueryBy }),
    ).toEqual({
      query_by: 'name,description',
      vector_query: undefined,
      exclude_fields: undefined,
      nl_query: undefined,
      nl_model_id: undefined,
    });
  });

  it('semantic: queries the embedding field and excludes it from the response', () => {
    const p = buildSearchModeParams({
      mode: 'semantic',
      textQueryBy,
      embeddingField: 'embedding',
      distanceThreshold: 0.45,
    });
    expect(p.query_by).toBe('embedding');
    expect(p.vector_query).toBe('embedding:([], k:100, distance_threshold:0.45)');
    expect(p.exclude_fields).toBe('embedding');
  });

  it('hybrid: mixes text + embedding in query_by with an alpha weight', () => {
    const p = buildSearchModeParams({
      mode: 'hybrid',
      textQueryBy,
      embeddingField: 'embedding',
      alpha: 0.7,
    });
    expect(p.query_by).toBe('name,description,embedding');
    expect(p.vector_query).toBe('embedding:([], alpha:0.7)');
    expect(p.exclude_fields).toBe('embedding');
  });

  it('semantic/hybrid fall back to keyword params when no embedding field exists', () => {
    expect(buildSearchModeParams({ mode: 'semantic', textQueryBy }).vector_query).toBeUndefined();
    expect(buildSearchModeParams({ mode: 'hybrid', textQueryBy }).query_by).toBe(
      'name,description',
    );
  });

  it('nl: sets nl_query + nl_model_id', () => {
    const p = buildSearchModeParams({
      mode: 'nl',
      textQueryBy,
      nlModelId: 'gpt-4o-mini',
    });
    expect(p.nl_query).toBe(true);
    expect(p.nl_model_id).toBe('gpt-4o-mini');
  });
});
