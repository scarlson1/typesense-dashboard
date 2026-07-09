import { collectionQueryKeys } from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
// import type { CollectionSchema } from '@/types';
import { queryClient } from '@/utils';
import { useMutation, type MutationOptions } from '@tanstack/react-query';
import type {
  CollectionSchema,
  CollectionUpdateSchema,
} from 'typesense/lib/Typesense/Collection';

interface UpdateCollectionArgs {
  colName: string;
  updates: CollectionUpdateSchema;
}
type UseUpdateCollection = Omit<
  MutationOptions<CollectionSchema, Error, UpdateCollectionArgs>,
  'mutationFn'
>;

export function useUpdateCollection(
  props?: UseUpdateCollection & { toastEnabled?: boolean },
) {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const {
    onMutate,
    onSuccess,
    onError,
    onSettled,
    toastEnabled = true,
    ...rest
  } = props || {};

  return useMutation({
    mutationFn: ({ colName, updates }: UpdateCollectionArgs) =>
      client.collections(colName).update(updates),
    onMutate: (vars, ctx) => {
      if (toastEnabled) toast.loading('saving...', { id: 'update-schema' });
      onMutate && onMutate(vars, ctx);
      return { name: vars.colName };
    },
    onSuccess: (data, vars, result, ctx) => {
      if (toastEnabled)
        toast.success(`collection updated`, { id: 'update-schema' });

      onSuccess && onSuccess(data, vars, result, ctx);
    },
    onError(err, vars, result, ctx) {
      console.log('ERROR: ', err);
      const msg = err.message ?? 'failed to update collection schema';
      if (/Another collection update operation is in progress/i.test(msg)) {
        toast.info('Embedding existing documents… this can take a while', {
          id: 'update-schema',
        });
        // optionally poll useSchema until the field appears, then toast.success
      } else {
        toast.error(msg, { id: 'update-schema' });
      }
      onError?.(err, vars, result, ctx);
      // if (toastEnabled) toast.error(msg, { id: 'update-schema' });

      // onError && onError(err, vars, result, ctx);
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
