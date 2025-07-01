import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { PresetSchema } from 'typesense/lib/Typesense/Preset';
import type { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';
import { presetQueryKeys } from '../constants';
import { useAsyncToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';

interface UpsertPresetVariables {
  presetId: string;
  params: PresetCreateSchema;
}

export type UseUpsertPresetProps = Omit<
  UseMutationOptions<PresetSchema, Error, UpsertPresetVariables>,
  'mutationFn'
>;

export const useUpsertPreset = (props?: UseUpsertPresetProps) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const { onMutate, onSuccess, onError, onSettled } = props || {};

  return useMutation({
    mutationFn: ({ presetId, params }: UpsertPresetVariables) =>
      client.presets().upsert(presetId, params),
    onMutate: (vars) => {
      queryClient.cancelQueries({
        queryKey: presetQueryKeys.all(clusterId),
      });
      toast.loading(`saving stopword set [${vars.presetId}]`, {
        id: 'save-presets',
      });
      onMutate && onMutate(vars);
      return vars;
    },
    onSuccess: (data, vars, ctx) => {
      toast.success(`presets saved [${data.name}]`, { id: 'save-presets' });
      onSuccess && onSuccess(data, vars, ctx);
    },
    onError: (err, vars, ctx) => {
      let msg = err.message || `error saving presets [${vars.presetId}]`;
      toast.error(msg, { id: 'save-presets' });
      onError && onError(err, vars, ctx);
    },
    onSettled: (data, err, vars, ctx) => {
      queryClient.invalidateQueries({
        queryKey: presetQueryKeys.all(clusterId),
      });
      onSettled && onSettled(data, err, vars, ctx);
    },
  });
};
