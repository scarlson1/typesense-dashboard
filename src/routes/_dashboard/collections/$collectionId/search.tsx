import { OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Card,
  Divider,
  Link,
  Skeleton,
  TextField,
  Typography,
  type TextFieldProps,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ChangeEventHandler,
} from 'react';
import type {
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';
import { useSearch } from '../../../../hooks';

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

// TODO: default query_by ??
let DEFAULT_QUERY_BY = ['company_name'];

function SearchCollection() {
  const { collectionId } = Route.useParams();
  // get collection schema defaults to populate params
  // const { data } = useCollectionSchema(collectionId)

  return (
    <>
      <Typography variant='h3' gutterBottom>
        {collectionId}
      </Typography>
      <Box sx={{ minHeight: 200 }}>TODO: search</Box>
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

      <Suspense fallback={<Skeleton variant='rounded' height={48} />}>
        <Search
          collectionId={collectionId}
          // TODO: load defaults from collection schema
          params={{ query_by: DEFAULT_QUERY_BY }}
        />
      </Suspense>

      <Card>
        <SearchParameters />
      </Card>
    </>
  );
}

interface SearchProps extends Omit<TextFieldProps, 'onChange'> {
  collectionId: string;
  params?: Omit<SearchParams, 'q'> | Omit<SearchParamsWithPreset, 'q'>;
}

function Search({ collectionId, params, ...props }: SearchProps) {
  const [term, setTerm] = useState<string>('');
  const { data } = useSearch({
    collectionId,
    q: term,
    params,
    debounceMs: 200,
  });

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setTerm(event.target.value);
    },
    []
  );

  useEffect(() => {
    console.log('DATA: ', data);
  }, [data]);

  return (
    <>
      <TextField
        onChange={handleChange}
        fullWidth
        disabled={!params?.query_by?.length}
        {...props}
      />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ py: 2 }}>{data?.hits ? <Hits hits={data?.hits} /> : null}</Box>
    </>
  );
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

function SearchParameters() {
  // const [client, clusterId] = useTypesenseClient();

  return (
    <Box>
      <Typography>Query By</Typography>
      <Typography>Facet & Filter By</Typography>
      <Typography>Sort By</Typography>
      <Typography>Group By</Typography>
      <Typography>Additional Search Parameters</Typography>
    </Box>
  );
}
