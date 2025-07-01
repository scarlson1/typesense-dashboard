import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';
import { multiParameterKeys, type MultiParameterKeys } from './presetsForm';

const omitKeys: MultiParameterKeys[] = [
  // 'collection',
  'query_by',
  'sort_by',
  'facet_by',
  'group_by',
];
export const filteredParamKeys = multiParameterKeys.options.filter(
  (k) => !omitKeys.includes(k)
);

export const searchParamValues = z.object({
  preset: z.string(),
  query_by: z.array(z.string()),
  sort_by: z.array(z.string()),
  facet_by: z.array(z.string()),
  group_by: z.array(z.string()),
  other_params: z.array(
    z.object({
      param: multiParameterKeys,
      value: z.string(),
    })
  ),
});
export type SearchParamValues = z.infer<typeof searchParamValues>;

export const NEW_EMPTY_OTHER_PARAM = { param: '', value: '' };

export const DEFAULT_SEARCH_PARAMS_VALUES = {
  preset: '',
  query_by: [] as string[],
  sort_by: [] as string[],
  facet_by: [] as string[],
  group_by: [] as string[],
  other_params: [NEW_EMPTY_OTHER_PARAM],
};

export const searchParamsFormOpts = formOptions({
  defaultValues: DEFAULT_SEARCH_PARAMS_VALUES,
  validators: {
    onChange: searchParamValues,
  },
});
