export const collectionQueryKeys = {
  all: (clusterId: string) => [clusterId, 'collections'] as const,
  list: (clusterId: string, filters: any) =>
    [...collectionQueryKeys.all(clusterId), filters] as const, // [string, any],
  detail: (clusterId: string, id: string) =>
    [...collectionQueryKeys.all(clusterId), id] as const,
  names: (clusterId: string, options?: any) =>
    [...collectionQueryKeys.all(clusterId), 'names', options] as const,
  schemas: (clusterId: string) =>
    [...collectionQueryKeys.all(clusterId), 'schemas'] as const,
  schema: (clusterId: string, id: string) =>
    [...collectionQueryKeys.schemas(clusterId), id] as const,
  curation: (clusterId: string, collectionId: string) =>
    [
      ...collectionQueryKeys.detail(clusterId, collectionId),
      'curation',
    ] as const,
  curationDetail: (
    clusterId: string,
    collectionId: string,
    overrideId: string
  ) =>
    [
      ...collectionQueryKeys.detail(clusterId, collectionId),
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
