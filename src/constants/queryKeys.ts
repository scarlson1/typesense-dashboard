import type {
  DocumentSchema,
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';

export const collectionQueryKeys = {
  all: (clusterId: string) => [clusterId, 'collections'] as const,
  list: (clusterId: string, filters?: Record<string, unknown>) =>
    [...collectionQueryKeys.all(clusterId), filters] as const, // [string, unknown],
  collection: (clusterId: string, collectionId: string) =>
    [...collectionQueryKeys.all(clusterId), collectionId] as const,
  names: (clusterId: string, options?: Record<string, unknown>) =>
    [...collectionQueryKeys.all(clusterId), 'names', options] as const,
  schemas: (clusterId: string) =>
    [...collectionQueryKeys.all(clusterId), 'schemas'] as const,
  schema: (clusterId: string, id: string) =>
    [...collectionQueryKeys.schemas(clusterId), id] as const,
  documents: (clusterId: string, collectionId: string) =>
    [
      ...collectionQueryKeys.collection(clusterId, collectionId),
      'documents',
    ] as const,
  document: (clusterId: string, collectionId: string, docId: string) =>
    [...collectionQueryKeys.documents(clusterId, collectionId), docId] as const,
  search: <T extends DocumentSchema>(
    clusterId: string,
    collectionId: string,
    params: SearchParams<T> | SearchParamsWithPreset<T, string>,
    // params: SearchParams<DocumentSchema> | SearchParamsWithPreset<DocumentSchema, string>,
    q: string,
  ) =>
    [
      ...collectionQueryKeys.documents(clusterId, collectionId),
      params,
      q,
    ] as const,
  synonyms: (clusterId: string, collectionId: string) =>
    [
      ...collectionQueryKeys.collection(clusterId, collectionId),
      'synonyms',
    ] as const,
  synonymSets: (clusterId: string) => [
    ...collectionQueryKeys.all(clusterId),
    'synonymSets',
  ],
  curation: (clusterId: string, collectionId: string) =>
    [
      ...collectionQueryKeys.collection(clusterId, collectionId),
      'curation',
    ] as const,
  curationDetail: (
    clusterId: string,
    collectionId: string,
    overrideId: string,
  ) =>
    [
      ...collectionQueryKeys.collection(clusterId, collectionId),
      'curation',
      overrideId,
    ] as const,
  curationSets: (clusterId: string) =>
    [...collectionQueryKeys.all(clusterId), 'curationSets'] as const,
};

export const apiKeyQueryKeys = {
  all: (clusterId: string) => [clusterId, 'keys'] as const,
};

export const aliasQueryKeys = {
  all: (clusterId: string) => [clusterId, 'aliases'] as const,
};

export const analyticsQueryKeys = {
  all: (clusterId: string) => [clusterId, 'analytics'] as const,
  rules: (clusterId: string) =>
    [...analyticsQueryKeys.all(clusterId), 'rules'] as const,
};

// Aggregated analytics data lives in a rule's destination collection
// (popular_queries / nohits_queries write `{ q, count }` documents).
export const analyticsDataQueryKeys = {
  all: (clusterId: string) => [...analyticsQueryKeys.all(clusterId), 'data'] as const,
  destination: (clusterId: string, destination: string) =>
    [...analyticsDataQueryKeys.all(clusterId), destination] as const,
};

export const presetQueryKeys = {
  all: (clusterId: string) => [clusterId, 'presets'] as const,
  // collection: (clusterId: string, collectionId: string) => [...presetQueryKeys.all(clusterId), collectionId] as const
};

// LLM-backed model resources (foundation for NL search + conversational/RAG).
export const nlSearchModelQueryKeys = {
  all: (clusterId: string) => [clusterId, 'nlSearchModels'] as const,
};

export const conversationModelQueryKeys = {
  all: (clusterId: string) => [clusterId, 'conversationModels'] as const,
};
