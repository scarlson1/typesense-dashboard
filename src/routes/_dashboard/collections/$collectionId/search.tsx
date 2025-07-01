import { OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  type TextFieldProps,
} from '@mui/material';
import { formOptions } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, type ChangeEventHandler } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import { z } from 'zod/v4';
import { InstantSearch } from '../../../../components';
import { collectionQueryKeys } from '../../../../constants';
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

      {/* TODO: fix default query_by */}
      <Typography variant='h6' color='primary' gutterBottom>
        Context Search
      </Typography>
      <InstantSearch<DocumentSchema>
        collectionId={collectionId}
        client={client}
        clusterId={clusterId}
        initialParams={{ query_by: DEFAULT_QUERY_BY }}
      >
        <SearchBox />
        <TempHits />
      </InstantSearch>

      <Typography variant='h6' color='primary' gutterBottom>
        Old Search
      </Typography>
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

      <Paper sx={{ p: 3, my: 2 }}>
        <SearchParameters collectionId={collectionId} />
      </Paper>
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
    <TextField
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

export const searchParamValues = z.object({
  query_by: z.array(z.string()),
  sort_by: z.array(z.string()),
});

export const DEFAULT_SEARCH_PARAMS_VALUES = {
  query_by: [] as string[],
  sort_by: [] as string[],
};

export const searchParamsFormOpts = formOptions({
  defaultValues: DEFAULT_SEARCH_PARAMS_VALUES,
  validators: {
    onChange: searchParamValues,
  },
});

const SearchParamsForm = withForm({
  ...searchParamsFormOpts,
  props: {
    queryByOptions: [] as string[],
    sortByOptions: [] as string[],
    submitButtonText: 'Save as Preset',
  },
  render: ({ form, queryByOptions, sortByOptions, submitButtonText }) => {
    return (
      <Grid container columnSpacing={3} rowSpacing={3}>
        <Grid
          size={{ xs: 12, sm: 4 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography>Query By</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <form.AppField name='query_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Query By'
                multiple
                options={queryByOptions}
                sx={{ maxWidth: 600 }}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 4 }}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Typography>Sort By</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <form.AppField name='sort_by' mode='array'>
            {({ Autocomplete }) => (
              <Autocomplete
                disablePortal
                label='Sort By'
                multiple
                options={sortByOptions}
                sx={{ maxWidth: 600 }}
              />
            )}
          </form.AppField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <form.AppForm>
            <form.SubmitButton label={submitButtonText} />
          </form.AppForm>
        </Grid>
      </Grid>
    );
  },
});

function SearchParamsFormComponent({
  queryByOptions,
  sortByOptions,
}: {
  queryByOptions: string[];
  sortByOptions: string[];
}) {
  const mutation = useUpsertPreset();

  const form = useAppForm({
    ...searchParamsFormOpts,
    onSubmit: async ({ value }) => {
      try {
        // @ts-ignore
        if (!value.query_by.length > 100)
          throw new Error('submit not implemented yet');

        await mutation.mutateAsync({ presetId: 'TODO', params: { value } });

        form.reset();
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <Box>
      <SearchParamsForm
        form={form}
        queryByOptions={queryByOptions}
        sortByOptions={sortByOptions}
        submitButtonText='Save as preset'
      />
    </Box>
  );
}

function SearchParameters({ collectionId }: { collectionId: string }) {
  // const [client, clusterId] = useTypesenseClient();
  const [client, clusterId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: collectionQueryKeys.schema(clusterId, collectionId),
    queryFn: () => client.collections(collectionId).retrieve(),
  });

  const queryByOptions = useMemo(
    () => data.fields.filter((field) => field.store).map((field) => field.name),
    [data?.fields]
  );

  const sortByOptions = useMemo(
    () =>
      data.fields
        .filter((field) => field.store && field.sort)
        .map((field) => field.name),
    [data?.fields]
  );

  return (
    <>
      <SearchParamsFormComponent
        queryByOptions={queryByOptions}
        sortByOptions={sortByOptions}
      />

      <Box sx={{ py: 3 }}>
        <Typography>Query By</Typography>
        <Typography>Facet & Filter By</Typography>
        <Typography>Sort By</Typography>
        <Typography>Group By</Typography>
        <Typography>Additional Search Parameters</Typography>
      </Box>
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
