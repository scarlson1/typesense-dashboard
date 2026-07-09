import { collectionQueryKeys } from '@/constants';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { DeleteResponse } from 'typesense/lib/Typesense/Documents';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

export type UseTruncateCollectionProps = Omit<
  UseMutationOptions<DeleteResponse, Error, string>,
  'mutationFn'
>;

/** Deletes all documents in a collection while keeping its schema. */
export const useTruncateCollection = (props?: UseTruncateCollectionProps) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  return useMutation({
    mutationFn: (collectionId: string) =>
      client.collections(collectionId).documents().delete({ truncate: true }),
    onMutate: (collectionId, ctx) => {
      toast.loading(`truncating ${collectionId}...`, {
        id: `truncate-${collectionId}`,
      });
      props?.onMutate && props.onMutate(collectionId, ctx);
    },
    onSuccess: (data, collectionId, result, ctx) => {
      toast.success(`${collectionId} truncated`, {
        id: `truncate-${collectionId}`,
      });
      props?.onSuccess && props.onSuccess(data, collectionId, result, ctx);
    },
    onError: (err, collectionId, result, ctx) => {
      const errMsg = err?.message || `an error occurred truncating ${collectionId}`;
      toast.error(errMsg, { id: `truncate-${collectionId}` });
      props?.onError && props.onError(err, collectionId, result, ctx);
    },
    onSettled: (data, err, collectionId, result, ctx) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.collection(clusterId, collectionId),
      });
      // num_documents lives under the schema key, not the collection key.
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.schema(clusterId, collectionId),
      });
      props?.onSettled && props.onSettled(data, err, collectionId, result, ctx);
    },
  });
};
