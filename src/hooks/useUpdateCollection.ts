import { collectionQueryKeys } from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import type { CollectionSchema } from '@/types';
import { queryClient } from '@/utils';
import { useMutation, type MutationOptions } from '@tanstack/react-query';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';

interface UpdateCollectionArgs {
  colName: string;
  updates: CollectionUpdateSchema;
}
type UseUpdateCollection = Omit<
  MutationOptions<CollectionSchema, Error, UpdateCollectionArgs>,
  'mutationFn'
>;

export function useUpdateCollection(props?: UseUpdateCollection) {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const { onMutate, onSuccess, onError, onSettled, ...rest } = props || {};

  return useMutation({
    mutationFn: ({ colName, updates }: UpdateCollectionArgs) =>
      client.collections(colName).update(updates),
    onMutate: (vars, ctx) => {
      toast.loading('saving...', { id: 'update-schema' });
      onMutate && onMutate(vars, ctx);
      return { name: vars.colName };
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`collection updated`, { id: 'update-schema' });

      onSuccess && onSuccess(data, vars, result, ctx);
    },
    onError(err, vars, result, ctx) {
      console.log('ERROR: ', err);
      const msg = err.message ?? 'failed to update collection schema';
      toast.error(msg, { id: 'update-schema' });

      onError && onError(err, vars, result, ctx);
    },
    onSettled: (data, err, vars, result, ctx) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.all(clusterId),
      });
      onSettled && onSettled(data, err, vars, result, ctx);
    },
    ...(rest || {}),
  });
}
