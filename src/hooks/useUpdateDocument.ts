import { collectionQueryKeys } from '@/constants';
import { useMutationToast, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { DocumentWriteParameters } from 'typesense/lib/Typesense/Documents';

export interface UpdateDocArgs {
  collectionId: string;
  docId: string;
  updates: object;
  options?: DocumentWriteParameters;
}
type UseUpdateDocumentProps = Omit<
  UseMutationOptions<object, Error, UpdateDocArgs, UpdateDocArgs>,
  'mutationFn'
>;

export const useUpdateDocument = (props: UseUpdateDocumentProps) => {
  const [client, clusterId] = useTypesenseClient();

  const { onMutate, onSuccess, onError } = useMutationToast<
    object,
    Error,
    UpdateDocArgs,
    UpdateDocArgs
  >({
    toastId: 'update-doc',
    loadingMsg: 'updating document...',
    successMsg: 'doc updated',
    errorMsg: (err) => err.message ?? 'failed to update document',
  });

  return useMutation({
    mutationFn: ({ collectionId, docId, updates, options }: UpdateDocArgs) =>
      client
        .collections(collectionId)
        .documents(docId)
        .update(updates, options),
    // ...toastHandlers,
    onMutate: (vars) => {
      onMutate && onMutate(vars);
      props?.onMutate && props?.onMutate(vars);
      return vars;
    },
    onSuccess: (data, vars, ctx) => {
      onSuccess && onSuccess(data, vars, ctx);
      props?.onSuccess && props?.onSuccess(data, vars, ctx);
    },
    onError: (err, vars, ctx) => {
      onError && onError(err, vars, ctx);
      props?.onError && props?.onError(err, vars, ctx);
    },
    onSettled: (data, err, vars, ctx) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.documents(clusterId, vars.collectionId),
      });
      props?.onSettled && props.onSettled(data, err, vars, ctx);
    },
  });
};
