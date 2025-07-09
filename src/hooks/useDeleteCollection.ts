import { collectionQueryKeys } from '@/constants';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

export type UseDeleteCollectionProps = Omit<
  UseMutationOptions<object | undefined, Error, string>,
  'mutationFn'
>;

export const useDeleteCollection = (props?: UseDeleteCollectionProps) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  return useMutation({
    mutationFn: (collectionId: string) =>
      client.collections(collectionId).delete(),
    onMutate: async (collectionId) => {
      await queryClient.cancelQueries({
        queryKey: collectionQueryKeys.list(clusterId, {}),
      });

      const collections: CollectionSchema[] | undefined =
        queryClient.getQueryData(collectionQueryKeys.list(clusterId, {}));
      const prevCollection = collections?.find((c) => c.name === collectionId);

      queryClient.setQueryData(
        collectionQueryKeys.list(clusterId, {}),
        (data: CollectionSchema[]) =>
          data.filter((c) => c.name !== collectionId)
      );

      toast.loading(`deleting collection [${collectionId}]`, {
        id: `delete-col-${collectionId}`,
      });
      props?.onMutate && props.onMutate(collectionId);

      let ctx: { collectionId: string; prevCollection?: CollectionSchema } = {
        collectionId,
      };
      if (prevCollection) ctx.prevCollection = prevCollection;
      return ctx;
    },
    onSuccess: (data, vars, ctx) => {
      toast.success(`collection "${vars}" deleted`, {
        id: `delete-col-${vars}`,
      });
      props?.onSuccess && props.onSuccess(data, vars, ctx);
    },
    onError: (err, vars, ctx) => {
      let errMsg = err?.message || `failed to delete collection ["${vars}"]`;
      toast.error(errMsg, { id: `delete-col-${vars}` });
      props?.onError && props.onError(err, vars, ctx);

      if (ctx?.prevCollection) {
        queryClient.setQueryData(
          collectionQueryKeys.list(clusterId, {}),
          (data: CollectionSchema[]) => [...data, ctx?.prevCollection]
        );
      }
    },
    onSettled: (data, err, vars, ctx) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.all(clusterId),
      });
      props?.onSettled && props.onSettled(data, err, vars, ctx);
    },
  });
};
