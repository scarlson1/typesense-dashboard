export const collectionQueryKeys = {
  all: (clusterId: string) => [clusterId, 'collections'] as const,
  list: (clusterId: string, filters: any) =>
    [...collectionQueryKeys.all(clusterId), filters] as const, // [string, any],
  detail: (clusterId: string, id: string) =>
    [...collectionQueryKeys.all(clusterId), id] as const,
};
