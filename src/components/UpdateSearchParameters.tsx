import {
  DEFAULT_SEARCH_PARAMS_VALUES,
  NEW_EMPTY_OTHER_PARAM,
  presetQueryKeys,
  searchParamsFormOpts,
  type SearchParamValues,
} from '@/constants';
import {
  useAppForm,
  useCollectionSearchPreset,
  useDefaultIndexParams,
  usePreset,
  usePrevious,
  useSearchParams,
  useTypesenseClient,
  useUpsertPreset,
} from '@/hooks';
import { Box } from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type {
  DocumentSchema,
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';
import { SearchParamsForm } from './SearchParamsForm';

// TODO: reset filter_by when facet_by option is removed

export interface UpdateSearchParametersProps {
  collectionId: string;
  defaultValues?: SearchParamValues;
  // mutationProps?: UseUpsertPresetProps
}

export function UpdateSearchParameters({
  collectionId,
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
  const { getStoredPreset, setStoredPreset } = useCollectionSearchPreset(
    clusterId,
    collectionId,
  );

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
        const { preset } = value;
        const newValues = formValuesToPresetSchema(value as SearchParamValues);

        await mutation.mutateAsync({
          presetId: preset,
          params: { value: newValues },
        });
      } catch (err) {
        console.log(err);
      }
    },
  });

  // reset search preset on collection change (TODO: unless multi-collection ?? or preset includes filter on current collection ??)
  // TODO: need to move up higher ?? reset query_by and sort_by ??
  // useEffect(() => {
  //   const p: PresetSchema<DocumentSchema> | undefined = presets.find(
  //     (pre) => pre.name === preset,
  //   );
  //   console.log('CURRENT PRESET: ', p);
  //   if (p) {
  //     const pre = p.value;

  //     if (
  //       // @ts-expect-error collection doesn't exist on PresetSchema ??
  //       !(pre.collectionId == collectionId || pre.collection == collectionId)
  //     ) {
  //       // reset if preset does not explicitly include collection
  //       setPreset(null);
  //     }
  //   } else {
  //     setPreset(null);
  //   }
  // }, [collectionId, presets]);

  const formPresetValue = useStore(form.store, (state) => state.values.preset);
  const prevFormPresetValue = usePrevious(formPresetValue);

  // update SearchContext preset on form preset is selection
  useEffect(() => {
    if (formPresetValue !== prevFormPresetValue) {
      const existingPreset = presets.find((p) => p.name === formPresetValue);
      if (existingPreset?.name) setPreset(existingPreset.name);
    }
  }, [presets, formPresetValue, prevFormPresetValue]);

  // update form preset when preset changes in SearchContext
  useEffect(() => {
    if (preset && preset !== prevPreset) form.setFieldValue('preset', preset); // will trigger update in SearchParamsForm's useEffect
  }, [preset, prevPreset]);

  const formFacetByValue = useStore(
    form.store,
    (state) => state.values.facet_by,
  );
  const prevFormFacetByValue = usePrevious(formFacetByValue);

  // reset filter_by if facet_by field is added or removed
  useEffect(() => {
    if (
      JSON.stringify(formFacetByValue) !== JSON.stringify(prevFormFacetByValue)
    )
      updateParams({ filter_by: undefined });
  }, [formFacetByValue, prevFormFacetByValue, updateParams]);

  const formValues = useStore(form.store, (state) => state.values);

  // update SearchContext preset when form preset is selected
  useEffect(() => {
    updateParams(formValuesToPresetSchema(formValues as SearchParamValues));
  }, [updateParams, formValues]);

  const prevCollectionId = usePrevious(collectionId);

  // Auto-default to first preset if nothing stored and no preset active (desired behavior ??)
  useEffect(() => {
    if (collectionId !== prevCollectionId) return;
    if (presets?.length && !preset && !getStoredPreset()) {
      const firstPreset = presets[0].name;
      setPreset(firstPreset);
      setStoredPreset(firstPreset);
    }
  }, [presets, collectionId, prevCollectionId]); // only run when presets load

  // Sync preset selection to localStorage
  useEffect(() => {
    if (collectionId !== prevCollectionId) return;
    if (formPresetValue !== prevFormPresetValue) {
      const existingPreset = presets.find((p) => p.name === formPresetValue);
      if (existingPreset?.name) {
        setPreset(existingPreset.name);
        setStoredPreset(existingPreset.name);
      }
    }
  }, [
    presets,
    formPresetValue,
    prevFormPresetValue,
    collectionId,
    prevCollectionId,
  ]);

  // clear form if collection preset preference not set
  useEffect(() => {
    if (collectionId !== prevCollectionId) {
      const storedPresetPref = getStoredPreset();
      if (!storedPresetPref) {
        form.setFieldValue('preset', '');
        form.setFieldValue('query_by', queryByOptions);
        form.setFieldValue('sort_by', ['']);
        form.setFieldValue('facet_by', ['']);
        form.setFieldValue('group_by', ['']);
        form.setFieldValue('other_params', [NEW_EMPTY_OTHER_PARAM]);
      }
    }
  }, [
    collectionId,
    prevCollectionId,
    getStoredPreset,
    form.setFieldValue,
    queryByOptions,
  ]);

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
  const newObj: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isEmptyArray = Array.isArray(value) && !value.length;
    const isEmptyString = typeof value === 'string' && !value.trim().length;
    if (!(isEmptyArray || isEmptyString)) {
      newObj[key as keyof T] = value;
    }
    if (isEmptyArray || isEmptyString) newObj[key as keyof T] = undefined;
  }
  return newObj;
}

function formValuesToPresetSchema<T extends DocumentSchema>(
  values: SearchParamValues,
): SearchParams<T, string> | SearchParamsWithPreset<T, string> {
  const { preset, other_params, facet_by, sort_by, query_by, group_by } =
    values;

  const otherParams = other_params
    .filter(({ param }) => param)
    .map((p) => ({
      [p.param]: p.value,
    }));

  const formattedValues = {
    query_by, // TODO: validate query_by values
    preset: preset || undefined,
    facet_by: facet_by.join(','),
    sort_by: sort_by.slice(0, 3).join(','),
    group_by: group_by.join(','),
    ...(otherParams[0] || {}),
  };

  return filterEmptyProperties<
    SearchParams<T> | SearchParamsWithPreset<T, string>
  >(formattedValues);
}
