import { useMutation } from '@tanstack/react-query';
import type { CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection';
import { collectionQueryKeys } from '../constants';
import { useMutationToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';

interface UpdateCollectionArgs {
  collectionId: string;
  docId: string;
  updates: CollectionUpdateSchema;
}

interface UseUpdateDocumentProps {
  onSuccess?: (data: any, vars: UpdateCollectionArgs) => void;
  onError?: (err: Error, vars: any) => void;
}

// TODO: pass onSuccess etc. options ??
export const useUpdateDocument = (props: UseUpdateDocumentProps) => {
  const [client, clusterId] = useTypesenseClient();

  const { onMutate, onSuccess, onError } = useMutationToast<
    object,
    Error,
    UpdateCollectionArgs,
    UpdateCollectionArgs
  >({
    toastId: 'update-doc',
    loadingMsg: 'test loading...',
    successMsg: 'success',
    errorMsg: (err) => err.message ?? 'failed to update document',
  });

  return useMutation({
    mutationFn: ({ collectionId, docId, updates }: UpdateCollectionArgs) =>
      client.collections(collectionId).documents(docId).update(updates),
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
