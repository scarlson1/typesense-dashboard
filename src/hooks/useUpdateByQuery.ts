import { collectionQueryKeys } from '@/constants';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { UpdateByFilterResponse } from 'typesense/lib/Typesense/Documents';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

interface UpdateByQueryVars {
  collectionId: string;
  document: Record<string, unknown>;
  filterBy: string;
}
export type UseUpdateByQueryProps = Omit<
  UseMutationOptions<UpdateByFilterResponse, Error, UpdateByQueryVars>,
  'mutationFn'
>;

/** Patches the provided fields onto every document matching filterBy. */
export const useUpdateByQuery = (props?: UseUpdateByQueryProps) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  return useMutation({
    mutationFn: ({ collectionId, document, filterBy }: UpdateByQueryVars) =>
      client
        .collections(collectionId)
        .documents()
        .update(document, { filter_by: filterBy }),
    onMutate: (vars, ctx) => {
      toast.loading(`updating documents matching filter...`, {
        id: `update-by-query-${vars.collectionId}`,
      });
      props?.onMutate && props.onMutate(vars, ctx);
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`updated ${data.num_updated} documents`, {
        id: `update-by-query-${vars.collectionId}`,
      });
      props?.onSuccess && props.onSuccess(data, vars, result, ctx);
    },
    onError: (err, vars, result, ctx) => {
      const errMsg = err?.message || `an error occurred updating documents`;
      toast.error(errMsg, { id: `update-by-query-${vars.collectionId}` });
      props?.onError && props.onError(err, vars, result, ctx);
    },
    onSettled: (data, err, vars, result, ctx) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.collection(clusterId, vars.collectionId),
      });
      props?.onSettled && props.onSettled(data, err, vars, result, ctx);
    },
  });
};
