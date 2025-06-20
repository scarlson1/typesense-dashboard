import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { collectionQueryKeys } from '../constants';
import { queryClient } from '../utils';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

type UseNewCollectionProps = Omit<
  UseMutationOptions<CollectionSchema, Error, CollectionCreateSchema>,
  'mutationFn'
>;

export const useNewCollection = (props?: UseNewCollectionProps) => {
  const navigate = useNavigate();
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  const { onSuccess, onError, ...rest } = props || {};

  return useMutation({
    ...rest,
    mutationFn: (values: CollectionCreateSchema) =>
      client.collections().create(values),
    onSuccess: (data, vars) => {
      toast.success('collection created', { id: 'new-collection' });
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.all(clusterId),
      });

      onSuccess && onSuccess(data, vars, {});
      navigate({ from: '/collections/new', to: '..' });
    },
    onError: (e, vars, ctx) => {
      let msg = e.message || 'an error occurred';
      toast.error(msg, { id: 'new-collection' });
      onError && onError(e, vars, ctx);
    },
  });
};
