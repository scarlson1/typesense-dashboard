export const collectionQueryKeys = {
  all: ['collections'] as const,
  list: (filters: any) => [...collectionQueryKeys.all, filters] as const, // [string, any],
  detail: (id: string) => [...collectionQueryKeys.all, id] as const,
};
