import { collectionQueryKeys } from '@/constants';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { DeleteResponse } from 'typesense/lib/Typesense/Documents';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

interface DeleteByQueryVars {
  collectionId: string;
  filterBy: string;
  batchSize?: number;
}
export type UseDeleteByQueryProps = Omit<
  UseMutationOptions<DeleteResponse, Error, DeleteByQueryVars>,
  'mutationFn'
>;

export const useDeleteByQuery = (props?: UseDeleteByQueryProps) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  return useMutation({
    mutationFn: ({ collectionId, filterBy, batchSize }: DeleteByQueryVars) =>
      client.collections(collectionId).documents().delete({
        filter_by: filterBy,
        batch_size: batchSize,
        ignore_not_found: true,
      }),
    onMutate: (vars, ctx) => {
      toast.loading(`deleting documents matching filter...`, {
        id: `delete-by-query-${vars.collectionId}`,
      });
      props?.onMutate && props.onMutate(vars, ctx);
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`deleted ${data.num_deleted} documents`, {
        id: `delete-by-query-${vars.collectionId}`,
      });
      props?.onSuccess && props.onSuccess(data, vars, result, ctx);
    },
    onError: (err, vars, result, ctx) => {
      const errMsg = err?.message || `an error occurred deleting documents`;
      toast.error(errMsg, { id: `delete-by-query-${vars.collectionId}` });
      props?.onError && props.onError(err, vars, result, ctx);
    },
    onSettled: (data, err, vars, result, ctx) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.collection(clusterId, vars.collectionId),
      });
      // num_documents lives under the schema key, not the collection key.
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.schema(clusterId, vars.collectionId),
      });
      props?.onSettled && props.onSettled(data, err, vars, result, ctx);
    },
  });
};
