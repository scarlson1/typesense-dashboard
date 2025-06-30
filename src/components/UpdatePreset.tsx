import { Box } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import type { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';
import {
  DEFAULT_PRESET_VALUES,
  presetQueryKeys,
  presetsFormOpts,
  presetType,
  type MultiParameterKeys,
  type ParameterKeys,
} from '../constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '../hooks';
import { queryClient } from '../utils';
import { PresetsForm } from './PresetsForm';

interface UpdatePresetProps {
  defaultValues?: any;
  submitButtonText?: string;
}

export function UpdatePreset({
  defaultValues = DEFAULT_PRESET_VALUES,
  submitButtonText = 'Submit',
}: UpdatePresetProps) {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();
  const mutation = useMutation({
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

  const form = useAppForm({
    ...presetsFormOpts,
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        // TODO: handle param value types aside from strings (arrays, numbers, etc.)
        // use zod refine / coerce ??
        let presetValue: PresetCreateSchema['value'] = {};
        if (value.presetType === presetType.enum['Single-Collection']) {
          let x = value.searchParameters.map(
            (p: { name: ParameterKeys; value: string }) => ({
              [p.name]: p.value,
            })
          );
          presetValue = x[0];
        } else if (value.presetType === presetType.enum['Multi-Search']) {
          presetValue = {
            // union: true,
            searches: value.multiSearchParams.map(
              (p: { name: MultiParameterKeys; value: string }[]) =>
                Object.assign(
                  {},
                  ...p.map((params) => ({ [params.name]: params.value }))
                )
            ),
          };
        }

        await mutation.mutateAsync({
          presetId: value.presetId,
          params: {
            value: presetValue,
          },
        });
        form.reset(); // TODO: fix reset when updating (resets to original values before react query updates - optimistic update ??)
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <Box
      component='form'
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <PresetsForm form={form} submitButtonText={submitButtonText} />
    </Box>
  );
}
