import { presetQueryKeys } from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import type { PresetSchema } from 'typesense/lib/Typesense/Preset';
import type { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';

interface UpsertPresetVariables<T extends DocumentSchema> {
  presetId: string;
  params: PresetCreateSchema<T, string>;
}

export type UseUpsertPresetProps<T extends DocumentSchema> = Omit<
  UseMutationOptions<PresetSchema<T>, Error, UpsertPresetVariables<T>>,
  'mutationFn'
>;

export const useUpsertPreset = <T extends DocumentSchema>(
  props?: UseUpsertPresetProps<T>,
) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const { onMutate, onSuccess, onError, onSettled } = props || {};

  return useMutation({
    mutationFn: ({ presetId, params }: UpsertPresetVariables<T>) =>
      client.presets().upsert(presetId, params),
    onMutate: (vars, ctx) => {
      queryClient.cancelQueries({
        queryKey: presetQueryKeys.all(clusterId),
      });
      toast.loading(`saving stopword set [${vars.presetId}]`, {
        id: 'save-presets',
      });
      onMutate && onMutate(vars, ctx);
      return vars;
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`presets saved [${data.name}]`, { id: 'save-presets' });
      onSuccess && onSuccess(data, vars, result, ctx);
    },
    onError: (err, vars, result, ctx) => {
      const msg = err.message || `error saving presets [${vars.presetId}]`;
      toast.error(msg, { id: 'save-presets' });
      onError && onError(err, vars, result, ctx);
    },
    onSettled: (data, err, vars, result, ctx) => {
      queryClient.invalidateQueries({
        queryKey: presetQueryKeys.all(clusterId),
      });
      onSettled && onSettled(data, err, vars, result, ctx);
    },
  });
};
