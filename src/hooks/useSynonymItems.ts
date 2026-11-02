import { collectionQueryKeys } from '@/constants';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { ObjectNotFound } from 'typesense/lib/Typesense/Errors';
import type {
  SynonymItemSchema,
  SynonymSetSchema,
} from 'typesense/lib/Typesense/SynonymSets';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

/**
 * Item-level writes for v30 synonym sets.
 *
 * A set is a container of many items, so every write here goes through
 * `/synonym_sets/:set/items/:id`. Upserting the *set* instead
 * (`client.synonymSets(name).upsert({ items: [...] })`) replaces its entire
 * item list — which silently drops sibling rules, and the v29 → v30
 * auto-migration puts a collection's whole synonym list into a single set.
 */

export interface SynonymItemVars {
  setName: string;
  itemId: string;
  item: Omit<SynonymItemSchema, 'id'>;
}

export interface SynonymItemDeleteVars {
  setName: string;
  itemId: string;
}

export type UseUpsertSynonymItemProps = Omit<
  UseMutationOptions<SynonymItemSchema, Error, SynonymItemVars>,
  'mutationFn'
>;

export const useUpsertSynonymItem = (props?: UseUpsertSynonymItemProps) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  return useMutation({
    mutationFn: async ({ setName, itemId, item }: SynonymItemVars) => {
      // The items endpoint needs its set to exist. Probe first rather than
      // unconditionally upserting an empty set, which would wipe an existing
      // one.
      try {
        await client.synonymSets(setName).retrieve();
      } catch (err) {
        if (!(err instanceof ObjectNotFound)) throw err;
        await client.synonymSets(setName).upsert({ items: [] });
      }
      return client.synonymSets(setName).items().upsert(itemId, item);
    },
    onMutate: (vars, ctx) => {
      toast.loading(`saving synonym rule [${vars.itemId}]...`, {
        id: 'save-synonym',
      });
      props?.onMutate && props.onMutate(vars, ctx);
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`synonym rule saved [${vars.itemId}]`, {
        id: 'save-synonym',
      });
      props?.onSuccess && props.onSuccess(data, vars, result, ctx);
    },
    onError: (err, vars, result, ctx) => {
      const msg = err?.message || `error saving synonym rule [${vars.itemId}]`;
      toast.error(msg, { id: 'save-synonym' });
      props?.onError && props.onError(err, vars, result, ctx);
    },
    onSettled: (data, err, vars, result, ctx) => {
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.synonymSets(clusterId),
      });
      props?.onSettled && props.onSettled(data, err, vars, result, ctx);
    },
  });
};

interface DeleteContext {
  prev?: SynonymSetSchema[];
}

export const useDeleteSynonymItem = () => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();
  const setsKey = collectionQueryKeys.synonymSets(clusterId);

  return useMutation({
    mutationFn: ({ setName, itemId }: SynonymItemDeleteVars) =>
      client.synonymSets(setName).items(itemId).delete(),
    onMutate: async ({ setName, itemId }): Promise<DeleteContext> => {
      await queryClient.cancelQueries({ queryKey: setsKey });

      const prev = queryClient.getQueryData<SynonymSetSchema[]>(setsKey);

      // Drop the single item; the set itself stays, even when it empties out.
      queryClient.setQueryData(setsKey, (old: SynonymSetSchema[] | undefined) =>
        old?.map((set) =>
          set.name === setName
            ? { ...set, items: set.items.filter((i) => i.id !== itemId) }
            : set,
        ),
      );

      toast.loading(`deleting [${itemId}]...`, { id: 'delete-synonym' });

      return { prev };
    },
    onSuccess: (_, { itemId }) => {
      toast.success(`synonym deleted [${itemId}]`, { id: 'delete-synonym' });
    },
    onError: (err, _vars, ctx) => {
      toast.error(err.message || 'failed to delete synonym', {
        id: 'delete-synonym',
      });
      if (ctx?.prev) queryClient.setQueryData(setsKey, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: setsKey });
    },
  });
};
