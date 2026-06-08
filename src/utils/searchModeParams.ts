/**
 * Translate a search "mode" (keyword / semantic / hybrid / natural language)
 * into the Typesense search parameters that implement it. Kept as a pure
 * function so the mode UI and the InstantSearch request stay in sync and the
 * logic is unit-testable.
 *
 * - keyword:  plain `query_by` over text fields.
 * - semantic: `query_by` = the embedding field; `vector_query` with an empty
 *             vector triggers server-side query embedding; optional distance cap.
 * - hybrid:   `query_by` mixes text + embedding fields, fused via `alpha`.
 * - nl:       `nl_query` + `nl_model_id`; the LLM produces filter/sort/q.
 *
 * Embedding vectors are large, so semantic/hybrid always `exclude_fields` the
 * embedding field from the response.
 */
export type SearchMode = 'keyword' | 'semantic' | 'hybrid' | 'nl';

export interface SearchModeInput {
  mode: SearchMode;
  /** Text fields used for keyword/hybrid `query_by`. */
  textQueryBy: string[];
  /** Name of the `float[]` embedding field, if the collection has one. */
  embeddingField?: string;
  /** Hybrid keyword↔vector weight (0–1). */
  alpha?: number;
  /** Semantic max vector distance. */
  distanceThreshold?: number;
  /** Selected NL search model id. */
  nlModelId?: string;
}

export interface SearchModeParams {
  query_by?: string;
  vector_query?: string;
  exclude_fields?: string;
  nl_query?: boolean;
  nl_model_id?: string;
}

export const SEARCH_MODES: SearchMode[] = [
  'keyword',
  'semantic',
  'hybrid',
  'nl',
];

export function buildSearchModeParams({
  mode,
  textQueryBy,
  embeddingField,
  alpha,
  distanceThreshold,
  nlModelId,
}: SearchModeInput): SearchModeParams {
  const text = textQueryBy.join(',');

  // Explicit `undefined` for inapplicable keys so merging into existing params
  // clears settings left over from a previous mode.
  const base: SearchModeParams = {
    query_by: text,
    vector_query: undefined,
    exclude_fields: undefined,
    nl_query: undefined,
    nl_model_id: undefined,
  };

  switch (mode) {
    case 'semantic': {
      if (!embeddingField) return base;
      const parts = ['[]', 'k:100'];
      if (distanceThreshold != null)
        parts.push(`distance_threshold:${distanceThreshold}`);
      return {
        ...base,
        query_by: embeddingField,
        vector_query: `${embeddingField}:(${parts.join(', ')})`,
        exclude_fields: embeddingField,
      };
    }
    case 'hybrid': {
      if (!embeddingField) return base;
      const vec =
        alpha != null ? `${embeddingField}:([], alpha:${alpha})` : `${embeddingField}:([])`;
      return {
        ...base,
        query_by: [...textQueryBy, embeddingField].join(','),
        vector_query: vec,
        exclude_fields: embeddingField,
      };
    }
    case 'nl': {
      return { ...base, nl_query: true, nl_model_id: nlModelId };
    }
    case 'keyword':
    default:
      return base;
  }
}
