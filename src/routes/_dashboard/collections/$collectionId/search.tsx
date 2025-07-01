import {
  AddRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
  RemoveRounded,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Grid,
  IconButton,
  Link,
  Autocomplete as MuiAutocomplete,
  TextField as MuiTextField,
  Paper,
  Stack,
  Typography,
  type TextFieldProps,
} from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  Fragment,
  Suspense,
  useCallback,
  useMemo,
  type ChangeEventHandler,
} from 'react';
import type {
  DocumentSchema,
  SearchParams,
} from 'typesense/lib/Typesense/Documents';
import type { MultiSearchRequestsSchema } from 'typesense/lib/Typesense/MultiSearch';
import type { PresetSchema } from 'typesense/lib/Typesense/Preset';
import { z } from 'zod/v4';
import { ButtonLink, InstantSearch } from '../../../../components';
import {
  collectionQueryKeys,
  multiParameterKeys,
  presetQueryKeys,
  type MultiParameterKeys,
} from '../../../../constants';
import {
  useAppForm,
  useHits,
  useSearch,
  useTypesenseClient,
  useUpsertPreset,
  withForm,
} from '../../../../hooks';

// 1) create context (https://github.com/algolia/instantsearch/blob/master/packages/react-instantsearch-core/src/components/InstantSearch.tsx)

// 2) create hooks (useIndexContext vs useInstantSearchContext - need both ??)
//      - ex: useSearchResults (https://github.com/algolia/instantsearch/blob/master/packages/react-instantsearch-core/src/lib/useSearchResults.ts)
//      - https://github.com/algolia/instantsearch/blob/master/packages/react-instantsearch-core/src/lib/useInstantSearchApi.ts

// 3) create UI components (roughly mapped to hooks ??)

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/search'
)({
  component: SearchCollection,
  staticData: {
    crumb: 'Search',
  },
});

// const useCollectionSchema = (collectionId: string) => {
//   const [ client, clusterId] = useTypesenseClient()

//   return useSuspenseQuery({
//     queryKey: collectionQueryKeys.schema(clusterId, collectionId),
//     queryFn: () => client.collections(collectionId).retrieve()
//   })
// }

// TODO: default query_by ?? where should this be retrieved from before being explicitly set ??
let DEFAULT_QUERY_BY = ['company_name'];

function SearchCollection() {
  const { collectionId } = Route.useParams();
  const [client, clusterId] = useTypesenseClient();
  // get collection schema defaults to populate params
  // const { data } = useCollectionSchema(collectionId)

  return (
    <>
      <Typography variant='h3' gutterBottom>
        {collectionId}
      </Typography>
      <ButtonLink
        from={Route.path}
        hash='#search-params'
        endIcon={<ExpandMoreRounded />}
        size='small'
      >
        Search Parameters
      </ButtonLink>

      <InstantSearch<DocumentSchema>
        collectionId={collectionId}
        client={client}
        clusterId={clusterId}
        initialParams={{ query_by: DEFAULT_QUERY_BY }}
      >
        <SearchBox />
        <TempHits />
      </InstantSearch>

      {/* <Suspense fallback={<Skeleton variant='rounded' height={48} />}>
        <Search
          collectionId={collectionId}
          // TODO: load defaults from collection schema
          params={{ query_by: DEFAULT_QUERY_BY }}
        />
      </Suspense> */}
      <Box sx={{ minHeight: 200 }}>TODO: search / hits</Box>

      <Typography variant='h5' gutterBottom>
        Search Parameters
      </Typography>
      <Typography component='div' gutterBottom>
        These settings control ranking, relevance and search fine-tuning. Use a
        preset to save your configuration, and recall in your application.{' '}
        <Link
          href='https://typesense.org/docs/28.0/api/search.html#search-parameters'
          target='_blank'
          rel='noopener noreferrer'
        >
          Docs
          <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.5 }} />
        </Link>
      </Typography>
      <Suspense>
        <Paper id='search-params'>
          <Container maxWidth='sm' sx={{ py: { xs: 3, sm: 4 } }}>
            <SearchParameters collectionId={collectionId} />
          </Container>
        </Paper>
      </Suspense>
    </>
  );
}

type SearchBoxProps = Omit<TextFieldProps, 'onChange'>;

function SearchBox(props: SearchBoxProps) {
  const { setQuery } = useSearch();

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setQuery(event.target.value);
    },
    []
  );

  return (
    <MuiTextField
      onChange={handleChange}
      fullWidth
      // disabled={!params?.query_by?.length}
      {...props}
    />
  );
}

function TempHits() {
  const hits = useHits();

  if (!hits?.hits)
    return (
      <Typography sx={{ textAlign: 'center', py: 2 }}>No results</Typography>
    );

  return <Hits hits={hits?.hits || []} />;
}

interface HitsProps {
  hits: any[];
}

function Hits({ hits }: HitsProps) {
  return (
    <>
      {hits.map((h) => (
        <Typography component='div' variant='h2' color='textSecondary'>
          <pre>{JSON.stringify(h, null, 2)}</pre>
        </Typography>
      ))}
    </>
  );
}

const omitKeys: MultiParameterKeys[] = [
  // 'collection',
  'query_by',
  'sort_by',
  'facet_by',
  'group_by',
];
const filteredParamKeys = multiParameterKeys.options.filter(
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

const NEW_EMPTY_OTHER_PARAM = { param: '', value: '' };

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

function getParams(val: PresetSchema['value']) {
  // TODO: handle multi-index
  if ((val as MultiSearchRequestsSchema).searches !== undefined)
    return (val as MultiSearchRequestsSchema).searches[0];
  return val as SearchParams;
}

function getArrayVal(val: string | string[]) {
  return Array.isArray(val) ? val : [val];
}

function uniqueArr(originalArray: string[]) {
  return [...new Set(originalArray)];
}

function splitIfString(val?: string | string[]) {
  if (!val) return [];
  return typeof val === 'string' ? val.split(',') : val;
}

const SearchParamsForm = withForm({
  ...searchParamsFormOpts,
  props: {
    presets: [] as PresetSchema[],

    queryByOptions: [] as string[],
    sortByOptions: [] as string[],
    facetByOptions: [] as string[],
    groupByOptions: [] as string[],
    submitButtonText: 'Save as Preset',
  },
  render: ({
    form,
    presets,
    queryByOptions,
    sortByOptions,
    facetByOptions,
    groupByOptions,
    submitButtonText,
  }) => {
    const presetOptions = useMemo(() => presets.map((p) => p.name), [presets]);

    const handlePresetChange = useCallback(
      (newVal: string) => {
        let existingPreset = presets.find((p) => p.name === newVal);
        if (existingPreset) {
          const { query_by, sort_by, facet_by, filter_by, group_by, ...rest } =
            getParams(existingPreset.value);

          form.setFieldValue('query_by', getArrayVal(splitIfString(query_by)));
          form.setFieldValue('sort_by', getArrayVal(splitIfString(sort_by)));
          form.setFieldValue(
            'facet_by',
            uniqueArr([
              ...getArrayVal(splitIfString(facet_by)),
              ...getArrayVal(splitIfString(filter_by)),
            ])
          );
          form.setFieldValue('group_by', getArrayVal(splitIfString(group_by)));

          let otherParams = [NEW_EMPTY_OTHER_PARAM];
          let otherParamsEntries = Object.entries(rest);
          if (otherParamsEntries.length) {
            otherParams = otherParamsEntries.map(([k, v]) => ({
              param: k,
              value: typeof v === 'string' ? v : JSON.stringify(v),
            }));
          }
          form.setFieldValue('other_params', otherParams);
        }
      },
      [presets]
    );

    return (
      <Grid container columnSpacing={3} rowSpacing={3}>
        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }}>Preset</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField
            name='preset'
            listeners={{
              onChange: ({ value }) => {
                handlePresetChange(value);
              },
            }}
          >
            {({ Autocomplete }) => (
              <Autocomplete
                freeSolo
                autoSelect
                disablePortal
                label='Preset'
                options={presetOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                }}
                textFieldProps={{
                  slotProps: {
                    input: {
                      type: 'search',
                    },
                  },
                }}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }}>Query By</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='query_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Query By'
                multiple
                options={queryByOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                  chip: { size: 'small' },
                }}
              />
            )}
          </form.AppField>
        </Grid>

        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }}>Sort By</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='sort_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Sort By'
                multiple
                options={sortByOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                  chip: { size: 'small' },
                }}
              />
            )}
          </form.AppField>
        </Grid>

        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }}>Facet & Filter By</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='facet_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Facet & Filter By'
                multiple
                options={facetByOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                  chip: { size: 'small' },
                }}
              />
            )}
          </form.AppField>
        </Grid>

        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ textAlign: 'right' }}>Group By</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='group_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Group By'
                multiple
                options={groupByOptions}
                sx={{ maxWidth: 600 }}
                slotProps={{
                  paper: {
                    sx: {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },
                  },
                  chip: { size: 'small' },
                }}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 3 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}
        >
          <Typography sx={{ textAlign: 'right', mt: 1 }}>
            Additional Parameters
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <form.AppField name='other_params' mode='array'>
            {({ state, pushValue, removeValue }) => (
              <Stack direction='column' spacing={2}>
                {state.value.map((_, i) => (
                  <Fragment key={`param-${i}`}>
                    <Stack direction='row' spacing={2}>
                      <form.Field name={`other_params[${i}].param`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiAutocomplete
                            disablePortal
                            options={filteredParamKeys}
                            sx={{ minWidth: 180, maxWidth: 300 }}
                            value={state.value}
                            onChange={(_, newVal: string | null) =>
                              handleChange(newVal || '')
                            }
                            blurOnSelect
                            autoHighlight
                            renderInput={(params: object) => (
                              <MuiTextField
                                {...params}
                                onBlur={handleBlur}
                                label='Parameter Name'
                              />
                            )}
                            slotProps={{
                              paper: {
                                sx: {
                                  border: (theme) =>
                                    `1px solid ${theme.palette.divider}`,
                                },
                              },
                              chip: { size: 'small' },
                            }}
                          />
                        )}
                      </form.Field>

                      <form.Field name={`other_params[${i}].value`}>
                        {({ state, handleChange, handleBlur }) => (
                          <MuiTextField
                            id={`other_params[${i}].value`}
                            label='Param Value'
                            placeholder='e.g. 1,4,8'
                            value={state.value}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            fullWidth
                            variant='outlined'
                            sx={{ maxWidth: 300 }}
                            error={state.meta.isTouched && !state.meta.isValid}
                            color={
                              state.meta.errors.length ? 'error' : 'primary'
                            }
                          />
                        )}
                      </form.Field>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}
                      >
                        <IconButton
                          onClick={() => removeValue(i)}
                          size='small'
                          color='error'
                          disabled={state.value.length <= 1 && i === 0}
                        >
                          <RemoveRounded fontSize='inherit' />
                        </IconButton>
                      </Box>
                    </Stack>
                  </Fragment>
                ))}
                <Box>
                  <IconButton
                    onClick={() => pushValue(NEW_EMPTY_OTHER_PARAM)}
                    size='small'
                    color='primary'
                  >
                    <AddRounded fontSize='inherit' />
                  </IconButton>
                </Box>
              </Stack>
            )}
          </form.AppField>
        </Grid>
        <Grid
          size={{ xs: 12 }}
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <form.AppForm>
            <form.SubmitButton label={submitButtonText} />
          </form.AppForm>
        </Grid>
      </Grid>
    );
  },
});

function SearchParamsFormComponent({
  presets,
  queryByOptions,
  sortByOptions,
  facetByOptions,
  groupByOptions,
}: {
  presets: PresetSchema[];
  queryByOptions: string[];
  sortByOptions: string[];
  facetByOptions: string[];
  groupByOptions: string[];
}) {
  const mutation = useUpsertPreset();

  const form = useAppForm({
    ...searchParamsFormOpts,
    onSubmit: async ({ value }) => {
      try {
        // @ts-ignore
        // if (value.query_by.length < 100)
        //   throw new Error('submit not implemented yet');

        let { preset, other_params, ...rest } = value;
        console.log('VALUE: ', preset, rest);
        let otherParams = other_params.map((p) => ({
          // { name: MultiParameterKeys; value: string }
          [p.param]: p.value,
        }));
        console.log('other params: ', otherParams);
        let newValues = {
          ...rest,
          filter_by: rest.facet_by.join(','),
          ...(otherParams[0] || {}),
        };

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

function SearchParameters({ collectionId }: { collectionId: string }) {
  const [client, clusterId] = useTypesenseClient();

  const { data: presets } = useSuspenseQuery({
    queryKey: presetQueryKeys.all(clusterId),
    queryFn: async () => {
      const { presets } = await client.presets().retrieve();
      return presets;
    },
  });

  // const presetOptions = useMemo(() => presets.map((p) => p.name), [presets]);
  // console.log('PRESETS: ', { presets, presetOptions });

  const { data } = useSuspenseQuery({
    queryKey: collectionQueryKeys.schema(clusterId, collectionId),
    queryFn: () => client.collections(collectionId).retrieve(),
  });

  const [queryByOptions, sortByOptions, facetByOptions, groupByOptions] =
    useMemo(() => {
      const queryByOptions = data.fields
        .filter((field) => field.index)
        .map((f) => f.name);

      const sortByOptions = data.fields
        .filter((field) => field.sort)
        .map((f) => f.name);

      const facetByOptions = data.fields
        .filter((field) => field.facet)
        .map((f) => f.name);

      const groupByOptions = data.fields
        .filter((field) => field.index)
        .map((f) => f.name);

      return [queryByOptions, sortByOptions, facetByOptions, groupByOptions];
    }, [data?.fields]);

  return (
    <>
      <SearchParamsFormComponent
        presets={presets}
        // presetOptions={presetOptions}
        queryByOptions={queryByOptions}
        sortByOptions={sortByOptions}
        facetByOptions={facetByOptions}
        groupByOptions={groupByOptions}
      />
    </>
  );
}

// interface SearchProps extends Omit<TextFieldProps, 'onChange'> {
//   collectionId: string;
//   params?: Omit<SearchParams, 'q'> | Omit<SearchParamsWithPreset, 'q'>;
// }

// function Search({ collectionId, params, ...props }: SearchProps) {
//   const [term, setTerm] = useState<string>('');
//   const { data } = useSearchOld({
//     collectionId,
//     q: term,
//     params,
//     debounceMs: 200,
//   });

//   const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
//     (event) => {
//       setTerm(event.target.value);
//     },
//     []
//   );

//   useEffect(() => {
//     console.log('DATA: ', data);
//   }, [data]);

//   return (
//     <>
//       <TextField
//         onChange={handleChange}
//         fullWidth
//         disabled={!params?.query_by?.length}
//         {...props}
//       />
//       <Divider sx={{ my: 2 }} />
//       {/* <Box sx={{ py: 2 }}>{data?.hits ? <Hits hits={data?.hits} /> : null}</Box> */}
//     </>
//   );
// }
