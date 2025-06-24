export const collectionQueryKeys = {
  all: (clusterId: string) => [clusterId, 'collections'] as const,
  list: (clusterId: string, filters: any) =>
    [...collectionQueryKeys.all(clusterId), filters] as const, // [string, any],
  detail: (clusterId: string, id: string) =>
    [...collectionQueryKeys.all(clusterId), id] as const,
  schemas: (clusterId: string) =>
    [...collectionQueryKeys.all(clusterId), 'schemas'] as const,
  schema: (clusterId: string, id: string) =>
    [...collectionQueryKeys.schemas(clusterId), id] as const,
};

export const apiKeyQueryKeys = {
  all: (clusterId: string) => [clusterId, 'keys'] as const,
};
