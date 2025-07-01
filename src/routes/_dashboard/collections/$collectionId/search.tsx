import { ExpandMoreRounded, OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Container,
  Link,
  TextField as MuiTextField,
  Paper,
  Typography,
  type TextFieldProps,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useCallback, type ChangeEventHandler } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import {
  ButtonLink,
  InstantSearch,
  UpdateSearchParameters,
} from '../../../../components';
import {
  useHits,
  useSearch,
  useSearchParams,
  useTypesenseClient,
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
        <SearchBox sx={{ my: 1 }} />
        <TempHits />
        <Box sx={{ minHeight: 200 }}>TODO: search / hits</Box>

        <Typography variant='h5' gutterBottom>
          Search Parameters
        </Typography>
        <Typography component='div' gutterBottom>
          These settings control ranking, relevance and search fine-tuning. Use
          a preset to save your configuration, and recall in your application.{' '}
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
              <UpdateSearchParameters collectionId={collectionId} />
            </Container>
          </Paper>
        </Suspense>
        <TempDisplaySearchParams />
      </InstantSearch>
    </>
  );
}

function TempDisplaySearchParams() {
  const [params] = useSearchParams();

  return (
    <Typography
      variant='body2'
      color='textSecondary'
      sx={{ py: 2 }}
      component='div'
    >
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </Typography>
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

// function SearchParamsFormComponent({
//   presets,
//   queryByOptions,
//   sortByOptions,
//   facetByOptions,
//   groupByOptions,
// }: {
//   presets: PresetSchema[];
//   queryByOptions: string[];
//   sortByOptions: string[];
//   facetByOptions: string[];
//   groupByOptions: string[];
// }) {
//   const mutation = useUpsertPreset();

//   const form = useAppForm({
//     ...searchParamsFormOpts,
//     onSubmit: async ({ value }) => {
//       try {
//         // @ts-ignore
//         // if (value.query_by.length < 100)
//         //   throw new Error('submit not implemented yet');

//         let { preset, other_params, ...rest } = value;
//         console.log('VALUE: ', preset, rest);
//         let otherParams = other_params.map((p) => ({
//           // { name: MultiParameterKeys; value: string }
//           [p.param]: p.value,
//         }));
//         console.log('other params: ', otherParams);
//         let newValues = {
//           ...rest,
//           filter_by: rest.facet_by.join(','),
//           ...(otherParams[0] || {}),
//         };

//         await mutation.mutateAsync({
//           presetId: preset,
//           params: { value: newValues },
//         });

//         // TODO: set preset in SearchContext ??

//         // setTimeout(form.reset, 100);
//       } catch (err) {
//         console.log(err);
//       }
//     },
//   });

//   return (
//     <Box
//       component='form'
//       onSubmit={(e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         form.handleSubmit();
//       }}
//       noValidate
//     >
//       <SearchParamsForm
//         form={form}
//         presets={presets}
//         queryByOptions={queryByOptions}
//         sortByOptions={sortByOptions}
//         facetByOptions={facetByOptions}
//         groupByOptions={groupByOptions}
//         submitButtonText='Save as preset'
//       />
//     </Box>
//   );
// }

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
