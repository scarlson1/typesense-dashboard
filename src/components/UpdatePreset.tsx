import {
  DEFAULT_PRESET_VALUES,
  presetsFormOpts,
  presetType,
  type MultiParameterKeys,
  type ParameterKeys,
} from '@/constants';
import {
  useAppForm,
  useUpsertPreset,
  type UseUpsertPresetProps,
} from '@/hooks';
import { Box } from '@mui/material';
import type { PresetCreateSchema } from 'typesense/lib/Typesense/Presets';
import { PresetsForm } from './PresetsForm';

interface UpdatePresetProps {
  defaultValues?: any;
  submitButtonText?: string;
  mutationProps?: UseUpsertPresetProps;
}

export function UpdatePreset({
  defaultValues = DEFAULT_PRESET_VALUES,
  submitButtonText = 'Submit',
  mutationProps,
}: UpdatePresetProps) {
  const mutation = useUpsertPreset(mutationProps);

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
        setTimeout(form.reset, 100);
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
