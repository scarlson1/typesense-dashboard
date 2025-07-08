import { Box } from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type {
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';
import {
  DEFAULT_SEARCH_PARAMS_VALUES,
  presetQueryKeys,
  searchParamsFormOpts,
  type SearchParamValues,
} from '../constants';
import {
  useAppForm,
  useDefaultIndexParams,
  usePreset,
  usePrevious,
  useSearchParams,
  useTypesenseClient,
  useUpsertPreset,
} from '../hooks';
import { SearchParamsForm } from './SearchParamsForm';

export interface UpdateSearchParametersProps {
  collectionId: string;
  defaultValues?: SearchParamValues;
  // mutationProps?: UseUpsertPresetProps
}

export function UpdateSearchParameters({
  collectionId,
  // mutationProps,
  ...props
}: UpdateSearchParametersProps) {
  const [_, updateParams] = useSearchParams();
  const [preset, setPreset] = usePreset();
  const [client, clusterId] = useTypesenseClient();
  const prevPreset = usePrevious(preset);
  const {
    defaultSortingField,
    queryByOptions,
    sortByOptions,
    facetByOptions,
    groupByOptions,
  } = useDefaultIndexParams();

  const { data: presets } = useSuspenseQuery({
    queryKey: presetQueryKeys.all(clusterId),
    queryFn: async () => {
      const { presets } = await client.presets().retrieve();
      return presets;
    },
  });

  const mutation = useUpsertPreset({
    onSuccess: (data) => {
      setPreset(data.name);
    },
  });

  const form = useAppForm({
    ...searchParamsFormOpts,
    defaultValues: {
      ...DEFAULT_SEARCH_PARAMS_VALUES,
      query_by: queryByOptions,
      sort_by: defaultSortingField ? [defaultSortingField] : [],
    },
    ...props,
    onSubmit: async ({ value }) => {
      try {
        let { preset } = value;

        let newValues = formValuesToPresetSchema(value as SearchParamValues);

        await mutation.mutateAsync({
          presetId: preset,
          params: { value: newValues },
        });
        // setTimeout(form.reset, 100);
      } catch (err) {
        console.log(err);
      }
    },
  });

  const formPresetValue = useStore(form.store, (state) => state.values.preset);
  const prevFormPresetValue = usePrevious(formPresetValue);

  // update SearchContext preset on form preset is selection
  useEffect(() => {
    if (formPresetValue !== prevFormPresetValue) {
      let existingPreset = presets.find((p) => p.name === formPresetValue);
      if (existingPreset?.name) setPreset(existingPreset.name);
    }
  }, [presets, formPresetValue, prevFormPresetValue]);

  // update form preset when preset changes in SearchContext
  useEffect(() => {
    if (preset && preset !== prevPreset) form.setFieldValue('preset', preset); // will trigger update in SearchParamsForm's useEffect
  }, [preset, prevPreset]);

  const formValues = useStore(form.store, (state) => state.values);

  // update SearchContext preset when form preset is selected
  useEffect(() => {
    updateParams(formValuesToPresetSchema(formValues as SearchParamValues));
  }, [updateParams, formValues]);

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
      <SearchParamsForm
        form={form}
        presets={presets}
        queryByOptions={queryByOptions}
        sortByOptions={sortByOptions}
        facetByOptions={facetByOptions}
        groupByOptions={groupByOptions}
        submitButtonText='Save as preset'
      />
    </Box>
  );
}

function filterEmptyProperties<T extends Record<string, any>>(obj: T) {
  let newObj: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    let isEmptyArray = Array.isArray(value) && !value.length;
    let isEmptyString = typeof value === 'string' && !value.trim().length;
    if (!(isEmptyArray || isEmptyString)) {
      newObj[key as keyof T] = value;
    }
    if (isEmptyArray || isEmptyString) newObj[key as keyof T] = undefined;
  }
  return newObj;
}

function formValuesToPresetSchema(
  values: SearchParamValues
): SearchParams | SearchParamsWithPreset {
  let { preset, other_params, facet_by, sort_by, query_by, group_by } = values;

  let otherParams = other_params.map((p) => ({
    [p.param]: p.value,
  }));

  let formattedValues = {
    query_by, // TODO: validate query_by values
    preset: preset || undefined,
    filter_by: facet_by.join(','),
    facet_by: facet_by.join(','),
    sort_by: sort_by.slice(0, 3).join(','),
    group_by: group_by.join(','),
    ...(otherParams[0] || {}),
  };

  return filterEmptyProperties<SearchParams | SearchParamsWithPreset>(
    formattedValues
  );
}
