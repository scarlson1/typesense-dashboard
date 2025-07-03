import { useMutation } from '@tanstack/react-query';
import type { DocumentWriteParameters } from 'typesense/lib/Typesense/Documents';
import { collectionQueryKeys } from '../constants';
import { useMutationToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';

export interface UpdateDocArgs {
  collectionId: string;
  docId: string;
  updates: object;
  options?: DocumentWriteParameters;
}

interface UseUpdateDocumentProps {
  onSuccess?: (data: any, vars: UpdateDocArgs) => void;
  onError?: (err: Error, vars: any) => void;
}

export const useUpdateDocument = (props: UseUpdateDocumentProps) => {
  const [client, clusterId] = useTypesenseClient();

  const { onMutate, onSuccess, onError } = useMutationToast<
    object,
    Error,
    UpdateDocArgs,
    UpdateDocArgs
  >({
    toastId: 'update-doc',
    loadingMsg: 'test loading...',
    successMsg: 'success',
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
      return vars;
    },
    onSuccess: (data, vars, ctx) => {
      onSuccess && onSuccess(data, vars, ctx);
      props?.onSuccess && props?.onSuccess(data, vars);
    },
    onError: (err, vars, ctx) => {
      onError && onError(err, vars, ctx);
      props?.onError && props?.onError(err, vars);
    },
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.documents(clusterId, vars.collectionId),
      });
    },
  });
};
