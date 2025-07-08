import { collectionQueryKeys } from '@/constants';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTypesenseClient } from './useTypesenseClient';

// if looking for collection schema from CollectionContext --> useCollectionSchema hook

export const useSchema = (collectionId: string) => {
  const [client, clusterId] = useTypesenseClient();

  return useSuspenseQuery({
    queryKey: collectionQueryKeys.schema(clusterId, collectionId),
    queryFn: () => client.collections(collectionId).retrieve(),
  });
};
