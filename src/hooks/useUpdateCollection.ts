import { useMutation } from '@tanstack/react-query';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';
import { collectionQueryKeys } from '../constants';
import { useAsyncToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';

interface UseUpdateCollection {
  onSuccess?: () => void;
  onError?: (err?: Error) => void;
}

export function useUpdateCollection(props?: UseUpdateCollection) {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  return useMutation({
    mutationFn: ({
      colName,
      updates,
    }: {
      colName: string;
      updates: CollectionUpdateSchema;
    }) => client.collections(colName).update(updates),
    onMutate: (variables) => {
      toast.loading('saving...', { id: 'update-schema' });
      return { name: variables.colName };
    },
    onSuccess: (_, __, context) => {
      // TODO: need to handle stale state of initialSchema
      toast.success(`listing updated`);
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.detail(clusterId, context.name),
      });

      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.all(clusterId),
      });

      props?.onSuccess && props.onSuccess();
    },
    onError(error) {
      console.log('ERROR: ', error);
      let msg = error.message ?? 'failed to update collection schema';
      toast.error(msg, { id: 'update-schema' });

      props?.onError && props.onError(error);
    },
  });
}
