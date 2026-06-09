import { buildHistoryCollectionSchema, collectionQueryKeys } from '@/constants';
import { useAsyncToast } from '@/hooks/useAsyncToast';
import { useTypesenseClient } from '@/hooks/useTypesenseClient';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';

type UseCreateHistoryCollectionProps = Omit<
  UseMutationOptions<CollectionSchema, Error, string>,
  'mutationFn'
>;

/**
 * Creates a conversation-history collection (fixed schema) for the given name.
 * Unlike useNewCollection it has no navigation side effect, so it can be called
 * from the conversation-model form and the RAG setup panel.
 */
export const useCreateHistoryCollection = (
  props?: UseCreateHistoryCollectionProps,
) => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();
  const { onSuccess, onError, ...rest } = props || {};

  return useMutation({
    ...rest,
    mutationFn: (name: string) =>
      client.collections().create(buildHistoryCollectionSchema(name)),
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`history collection "${data.name}" created`, {
        id: 'history-collection',
      });
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.all(clusterId),
      });
      onSuccess?.(data, vars, result, ctx);
    },
    onError: (e, vars, result, ctx) => {
      toast.error(e.message || 'error creating collection', {
        id: 'history-collection',
      });
      onError?.(e, vars, result, ctx);
    },
  });
};
