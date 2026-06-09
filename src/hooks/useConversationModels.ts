import { conversationModelQueryKeys } from '@/constants';
import { useAsyncToast } from '@/hooks/useAsyncToast';
import { useTypesenseClient } from '@/hooks/useTypesenseClient';
import { queryClient } from '@/utils';
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type {
  ConversationModelCreateSchema,
  ConversationModelSchema,
} from 'typesense/lib/Typesense/ConversationModel';

export const useConversationModels = () => {
  const [client, clusterId] = useTypesenseClient();
  return useQuery({
    queryKey: conversationModelQueryKeys.all(clusterId),
    queryFn: () => client.conversations().models().retrieve(),
    retry: false,
  });
};

type UseCreateConversationModelProps = Omit<
  UseMutationOptions<
    ConversationModelCreateSchema,
    Error,
    ConversationModelCreateSchema
  >,
  'mutationFn'
>;

export const useCreateConversationModel = (
  props?: UseCreateConversationModelProps,
) => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();
  const { onSuccess, onError, ...rest } = props || {};

  return useMutation({
    ...rest,
    mutationFn: (values: ConversationModelCreateSchema) =>
      client.conversations().models().create(values),
    onSuccess: (data, vars, result, ctx) => {
      toast.success('Conversation model created', { id: 'conversation-model' });
      queryClient.invalidateQueries({
        queryKey: conversationModelQueryKeys.all(clusterId),
      });
      onSuccess?.(data, vars, result, ctx);
    },
    onError: (e, vars, result, ctx) => {
      toast.error(e.message || 'error creating conversation model', {
        id: 'conversation-model',
      });
      onError?.(e, vars, result, ctx);
    },
  });
};

export const useDeleteConversationModel = () => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  return useMutation({
    mutationFn: (id: string) => client.conversations().models(id).delete(),
    onMutate: (id) => {
      toast.info(`deleting ["${id}"]`, { id: `conv-del-${id}` });
    },
    onSuccess: (_, id) => {
      toast.success(`"${id}" deleted`, { id: `conv-del-${id}` });
      queryClient.invalidateQueries({
        queryKey: conversationModelQueryKeys.all(clusterId),
      });
    },
    onError: (e, id) => {
      toast.error(e.message || `failed to delete ["${id}"]`, {
        id: `conv-del-${id}`,
      });
    },
  });
};

/** Models retrieved as a typed array (the SDK types create()'s return loosely). */
export type ConversationModel = ConversationModelSchema;
