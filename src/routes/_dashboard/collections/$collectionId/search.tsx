import {
  DataObjectRounded,
  DeleteRounded,
  EditRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Alert,
  ButtonGroup,
  Collapse,
  Container,
  IconButton,
  Link,
  TextField as MuiTextField,
  Paper,
  Stack,
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
import type {
  DocumentSchema,
  SearchResponseHit,
} from 'typesense/lib/Typesense/Documents';
import {
  ButtonLink,
  InstantSearch,
  UpdateSearchParameters,
} from '../../../../components';
import { useHits, useSearch, useTypesenseClient } from '../../../../hooks';

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

        <TempSearchError />

        <Hits />

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
      </InstantSearch>
    </>
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

// function TempHits() {
//   const hits = useHits();

//   useEffect(() => {
//     console.log('HITS: ', hits?.hits);
//   }, [hits?.hits]);

//   if (!hits?.hits)
//     return (
//       <Typography sx={{ textAlign: 'center', py: 2 }}>No results</Typography>
//     );

//   return (
//     <Box sx={{ py: 3 }}>
//       <JsonEditor
//         value={JSON.stringify({ ...hits?.hits }, null, 2)}
//         height={280}
//       />
//     </Box>
//   );
// }

function Hits() {
  const hits = useHits();

  if (!hits?.hits) return null;
  // return (
  //   <Typography sx={{ textAlign: 'center', py: 2 }}></Typography>
  // );

  if (!hits?.hits.length)
    return (
      <Typography sx={{ textAlign: 'center', py: 2 }}>No results</Typography>
    );

  return (
    <>
      {hits.hits.map((hit) => (
        <Hit hit={hit} />
      ))}
    </>
  );
}

function Hit({ hit }: { hit: SearchResponseHit<DocumentSchema> }) {
  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        my: { xs: 2, sm: 3 },
        position: 'relative',
      }}
    >
      <Stack
        direction='column'
        spacing={1}
        sx={{ maxHeight: 300, overflowX: 'auto' }}
      >
        {Object.entries(hit?.document).map(([key, value]) => (
          <Stack direction='row' spacing={3} key={key} sx={{ display: 'flex' }}>
            <Typography
              variant='body2'
              color='textSecondary'
              sx={{
                textAlign: 'right',
                width: { xs: 120, sm: 150, md: 200 },
                flex: '0 0 auto',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {key}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {typeof value === 'string' || typeof value === 'number'
                ? value
                : JSON.stringify(value)}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <ButtonGroup
        size='small'
        orientation='vertical'
        aria-label='Small button group'
        sx={{ position: 'absolute', right: '8px', top: '8px' }}
      >
        <IconButton
          onClick={() => alert('TODO: confirm delete document')}
          aria-label='delete'
          size='small'
        >
          <DeleteRounded fontSize='inherit' />
        </IconButton>
        <IconButton
          onClick={() => alert('TODO: open edit dialog')}
          aria-label='edit'
          size='small'
        >
          <EditRounded fontSize='inherit' />
        </IconButton>
        <IconButton
          onClick={() => alert('TODO: show data in dialog')}
          aria-label='view'
          size='small'
        >
          <DataObjectRounded fontSize='inherit' />
        </IconButton>
      </ButtonGroup>
    </Paper>
  );
}

function SearchStats() {
  const { data } = useSearch();
  console.log('DATA: ', data);

  return (
    <Typography variant='body2' color='text.secondary'>
      {data
        ? `${data?.found} results found from ${data?.out_of} docs in ${data?.search_time_ms}ms`
        : null}
    </Typography>
  );
}

function TempSearchError() {
  const { isError, error } = useSearch();

  useEffect(() => {
    if (error) console.log(error);
  }, [error]);

  let errMsg = error?.message || 'An error occurred. See console for details';
  return (
    <Collapse in={isError}>
      <Alert severity='warning'>{errMsg}</Alert>
    </Collapse>
  );
}
