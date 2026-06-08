import { nlSearchModelQueryKeys } from '@/constants';
import { useAsyncToast } from '@/hooks/useAsyncToast';
import { useTypesenseClient } from '@/hooks/useTypesenseClient';
import { queryClient } from '@/utils';
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type {
  NLSearchModelCreateSchema,
  NLSearchModelSchema,
} from 'typesense/lib/Typesense/NLSearchModels';

export const useNlSearchModels = () => {
  const [client, clusterId] = useTypesenseClient();
  return useQuery({
    queryKey: nlSearchModelQueryKeys.all(clusterId),
    queryFn: () => client.nlSearchModels().retrieve(),
    retry: false,
  });
};

type UseCreateNlSearchModelProps = Omit<
  UseMutationOptions<NLSearchModelSchema, Error, NLSearchModelCreateSchema>,
  'mutationFn'
>;

export const useCreateNlSearchModel = (props?: UseCreateNlSearchModelProps) => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();
  const { onSuccess, onError, ...rest } = props || {};

  return useMutation({
    ...rest,
    mutationFn: (values: NLSearchModelCreateSchema) =>
      client.nlSearchModels().create(values),
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`NL model created [${data.id}]`, { id: 'nl-model' });
      queryClient.invalidateQueries({
        queryKey: nlSearchModelQueryKeys.all(clusterId),
      });
      onSuccess?.(data, vars, result, ctx);
    },
    onError: (e, vars, result, ctx) => {
      toast.error(e.message || 'error creating NL model', { id: 'nl-model' });
      onError?.(e, vars, result, ctx);
    },
  });
};

export const useDeleteNlSearchModel = () => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  return useMutation({
    mutationFn: (id: string) => client.nlSearchModels(id).delete(),
    onMutate: (id) => {
      toast.info(`deleting ["${id}"]`, { id: `nl-del-${id}` });
    },
    onSuccess: (_, id) => {
      toast.success(`"${id}" deleted`, { id: `nl-del-${id}` });
      queryClient.invalidateQueries({
        queryKey: nlSearchModelQueryKeys.all(clusterId),
      });
    },
    onError: (e, id) => {
      toast.error(e.message || `failed to delete ["${id}"]`, {
        id: `nl-del-${id}`,
      });
    },
  });
};
