import type {
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';

export const collectionQueryKeys = {
  all: (clusterId: string) => [clusterId, 'collections'] as const,
  list: (clusterId: string, filters: any) =>
    [...collectionQueryKeys.all(clusterId), filters] as const, // [string, any],
  collection: (clusterId: string, collectionId: string) =>
    [...collectionQueryKeys.all(clusterId), collectionId] as const,
  names: (clusterId: string, options?: any) =>
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
  search: (
    clusterId: string,
    collectionId: string,
    params: SearchParams | SearchParamsWithPreset,
    q: string
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
  curation: (clusterId: string, collectionId: string) =>
    [
      ...collectionQueryKeys.collection(clusterId, collectionId),
      'curation',
    ] as const,
  curationDetail: (
    clusterId: string,
    collectionId: string,
    overrideId: string
  ) =>
    [
      ...collectionQueryKeys.collection(clusterId, collectionId),
      'curation',
      overrideId,
    ] as const,
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

export const presetQueryKeys = {
  all: (clusterId: string) => [clusterId, 'presets'] as const,
  // collection: (clusterId: string, collectionId: string) => [...presetQueryKeys.all(clusterId), collectionId] as const
};
