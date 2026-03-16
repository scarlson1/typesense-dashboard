import { collectionQueryKeys } from '@/constants';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

interface DeleteDocVars {
  collectionId: string;
  docId: string;
}
export type UseDeleteDocumentProps = Omit<
  UseMutationOptions<object | undefined, Error, DeleteDocVars>,
  'mutationFn'
>;

export const useDeleteDocument = (props?: UseDeleteDocumentProps) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  return useMutation({
    mutationFn: ({ collectionId, docId }: DeleteDocVars) =>
      client.collections(collectionId).documents(docId).delete(),
    onMutate: (vars, ctx) => {
      toast.loading(`deleting doc [${vars.docId}]`, {
        id: `delete-doc-${vars.docId}`,
      });
      props?.onMutate && props.onMutate(vars, ctx);
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`doc [${vars.docId}] deleted`, {
        id: `delete-doc-${vars.docId}`,
      });
      props?.onSuccess && props.onSuccess(data, vars, result, ctx);
    },
    onError: (err, vars, result, ctx) => {
      const errMsg =
        err?.message || `an error occurred when deleting doc ${vars.docId}`;
      toast.error(errMsg, { id: `delete-doc-${vars.docId}` });
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
