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
import {
  Suspense,
  useCallback,
  useEffect,
  type ChangeEventHandler,
} from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import {
  ButtonLink,
  InstantSearch,
  JsonEditor,
  UpdateSearchParameters,
} from '../../../../components';
import {
  useHits,
  useSearch,
  useSearchParams,
  useTypesenseClient,
} from '../../../../hooks';

// TODO: create wrapper to wait for context to load (CollectionProvider & InstantSearch)

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/search'
)({
  component: SearchCollection,
  staticData: {
    crumb: 'Search',
  },
});

function SearchCollection() {
  const { collectionId } = Route.useParams();
  const [client, clusterId] = useTypesenseClient();

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
        // TODO: need to set initial query by params from default index
        // move index above search in component hierarchy ?? pass defaults as prop to InstantSearch ??
        // initialParams={{ query_by: DEFAULT_QUERY_BY }}
      >
        <SearchBox sx={{ my: 1 }} />

        <SearchStats />

        <TempHits />

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

function SearchBox({ disabled, helperText, ...props }: SearchBoxProps) {
  const { setQuery, params } = useSearch();

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setQuery(event.target.value);
    },
    []
  );

  let queryByValid = Boolean(params?.query_by?.length);
  let helperTextVal = !queryByValid ? `"query_by" param required` : helperText;

  return (
    <MuiTextField
      onChange={handleChange}
      fullWidth
      helperText={helperTextVal}
      disabled={disabled || !Boolean(params?.query_by?.length)}
      error={!queryByValid}
      {...props}
    />
  );
}

function TempHits() {
  const hits = useHits();

  useEffect(() => {
    console.log('HITS: ', hits?.hits);
  }, [hits?.hits]);

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
      <Box sx={{ py: 3 }}>
        <JsonEditor value={JSON.stringify({ ...hits }, null, 2)} height={280} />
      </Box>
      {/* {hits.map((h) => (
        <Typography component='div' variant='body2' color='textSecondary'>
          <pre>{JSON.stringify(h, null, 2)}</pre>
        </Typography>
      ))} */}
    </>
  );
}

function SearchStats() {
  const { data } = useSearch();

  if (!data) return null;

  return (
    <Typography
      variant='subtitle2'
      color='text.secondary'
    >{`${data?.found_docs} results found from ${data?.found} docs in ${data?.search_time_ms}ms`}</Typography>
  );
}
