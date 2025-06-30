import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';
import { multiSearchRequestSchema, searchParams } from '../types';

export const parameterKeys = searchParams.keyof();
export type ParameterKeys = z.infer<typeof parameterKeys>;
export const multiParameterKeys = multiSearchRequestSchema.keyof();
export type MultiParameterKeys = z.infer<typeof multiParameterKeys>;

export const presetType = z.enum(['Single-Collection', 'Multi-Search']);

export const EMPTY_PRESET_PARAMS = {
  name: '',
  value: '',
};

export const presetsValuesSingle = z.object({
  presetId: z.string(),
  presetType: z.literal(presetType.enum['Single-Collection']),
  searchParameters: z.array(
    z.object({
      name: parameterKeys,
      value: z.string(),
    })
  ),
  multiSearchParams: z.any(),
});

export const presetsValuesMulti = z.object({
  presetId: z.string(),
  presetType: z.literal(presetType.enum['Multi-Search']),
  searchParameters: z.any(),
  multiSearchParams: z
    .array(
      z.array(
        z.object({
          name: multiParameterKeys,
          value: z.string(),
        })
      )
    )
    .min(1),
});

const presetsValues = z.discriminatedUnion('presetType', [
  presetsValuesSingle,
  presetsValuesMulti,
]);

export const DEFAULT_PRESET_VALUES = {
  presetId: '',
  presetType: presetType.enum['Single-Collection'] as string,
  searchParameters: [EMPTY_PRESET_PARAMS],
  multiSearchParams: [[EMPTY_PRESET_PARAMS], [EMPTY_PRESET_PARAMS]],
};

export const presetsFormOpts = formOptions({
  defaultValues: DEFAULT_PRESET_VALUES,
  validators: {
    onChange: presetsValues,
  },
});
