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

// TODO: initialize params in context with defaults from schema ??
// then use ctxParams to initialize form ??

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
  const [_, setParams] = useSearchParams();
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

  // const { data } = useSuspenseQuery({
  //   queryKey: collectionQueryKeys.schema(clusterId, collectionId),
  //   queryFn: () => client.collections(collectionId).retrieve(),
  // });

  // const [queryByOptions, sortByOptions, facetByOptions, groupByOptions] =
  //   useMemo(() => {
  //     const queryByOptions = data.fields
  //       .filter((field) => field.index)
  //       .map((f) => f.name);

  //     const sortByOptions = data.fields
  //       .filter((field) => field.sort)
  //       .map((f) => f.name);

  //     const facetByOptions = data.fields
  //       .filter((field) => field.facet)
  //       .map((f) => f.name);

  //     const groupByOptions = data.fields
  //       .filter((field) => field.index)
  //       .map((f) => f.name);

  //     return [queryByOptions, sortByOptions, facetByOptions, groupByOptions];
  //   }, [data?.fields]);

  const mutation = useUpsertPreset({
    onSuccess: (data) => {
      setPreset(data.name);
    },
  });

  const form = useAppForm({
    ...searchParamsFormOpts,
    defaultValues: {
      // TODO: use preset from context to set default values (and update when preset changes)
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
      if (existingPreset?.name) {
        console.log('UPDATING CONTEXT PRESET ON FORM PRESET SELECTION');
        setPreset(existingPreset.name);
      }
    }
  }, [presets, formPresetValue, prevFormPresetValue]);

  // update form preset when preset changes in SearchContext
  useEffect(() => {
    if (preset && preset !== prevPreset) {
      console.log(`UPDATING FORM PRESET ${preset}`);
      form.setFieldValue('preset', preset); // will trigger update in SearchParamsForm's useEffect
    }
  }, [preset, prevPreset]);

  // const formValuesFacetBy = useStore(form.store, (state) => state.values.facet_by);
  // const formValuesGroupBy = useStore(form.store, (state) => state.values.group_by);
  // const formValuesOtherParams = useStore(form.store, (state) => state.values.other_params);
  // const formValuesQueryBy = useStore(form.store, (state) => state.values.query_by);
  // const formValuesSortBy = useStore(form.store, (state) => state.values.sort_by);

  const formValues = useStore(form.store, (state) => state.values);
  // const prevFormValues = usePrevious(formValues)

  // update SearchContext preset when form preset is selected
  useEffect(() => {
    let newParams = formValuesToPresetSchema(formValues as SearchParamValues);
    console.log('SETTING CTX PARAMS: ', newParams);
    setParams((prev) => ({ ...prev, ...newParams }));
  }, [formValues]);

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
    if (!(isEmptyArray || isEmptyString)) newObj[key as keyof T] = value;
  }
  return newObj;
}

function formValuesToPresetSchema(
  values: SearchParamValues
): SearchParams | SearchParamsWithPreset {
  let { preset, other_params, ...rest } = values;

  let otherParams = other_params.map((p) => ({
    [p.param]: p.value,
  }));

  let formattedValues = {
    ...rest,
    preset: preset || undefined,
    filter_by: rest.facet_by.join(','),
    ...(otherParams[0] || {}),
  };

  return filterEmptyProperties<SearchParams | SearchParamsWithPreset>(
    formattedValues
  );
}
