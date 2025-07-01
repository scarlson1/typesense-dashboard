import { useMutation } from '@tanstack/react-query';
import type { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';
import { presetQueryKeys } from '../constants';
import { useAsyncToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';

export const useUpsertPreset = () => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();
  return useMutation({
    mutationFn: ({
      presetId,
      params,
    }: {
      presetId: string;
      params: PresetCreateSchema;
    }) => client.presets().upsert(presetId, params),
    onMutate: (vars) => {
      queryClient.cancelQueries({
        queryKey: presetQueryKeys.all(clusterId),
      });
      toast.loading(`saving stopword set [${vars.presetId}]`, {
        id: 'save-presets',
      });
      return vars;
    },
    onSuccess: (data) => {
      toast.success(`presets saved [${data.name}]`, { id: 'save-presets' });
    },
    onError: (err, vars) => {
      let msg = err.message || `error saving presets [${vars.presetId}]`;
      toast.error(msg, { id: 'save-presets' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: presetQueryKeys.all(clusterId),
      });
    },
  });
};
