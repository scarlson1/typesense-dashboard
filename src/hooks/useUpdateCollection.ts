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
    onMutate: (vars) => {
      toast.loading('saving...', { id: 'update-schema' });
      onMutate && onMutate(vars);
      return { name: vars.colName };
    },
    onSuccess: (data, vars, ctx) => {
      toast.success(`listing updated`, { id: 'update-schema' });

      onSuccess && onSuccess(data, vars, ctx);
    },
    onError(err, vars, ctx) {
      console.log('ERROR: ', err);
      let msg = err.message ?? 'failed to update collection schema';
      toast.error(msg, { id: 'update-schema' });

      onError && onError(err, vars, ctx);
    },
    onSettled: (data, err, vars, ctx) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.all(clusterId),
      });
      onSettled && onSettled(data, err, vars, ctx);
    },
    ...(rest || {}),
  });
}
