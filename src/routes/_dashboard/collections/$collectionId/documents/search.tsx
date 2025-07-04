import {
  AddRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import { Box, Container, Link, Paper, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import {
  ButtonLink,
  CollectionProvider,
  InstantSearch,
  UpdateSearchParameters,
} from '../../../../../components';
import {
  ContextHits,
  CtxPageSize,
  CtxPagination,
  CtxSearchError,
  CtxSearchStats,
  DashboardDisplayOptions,
  SearchBox,
} from '../../../../../components/search';
import { SearchSlotsProvider } from '../../../../../components/search/SearchSlotsProvider';
import { useTypesenseClient } from '../../../../../hooks';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search'
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
        hash='search-params'
        endIcon={<ExpandMoreRounded />}
        size='small'
      >
        Search Parameters
      </ButtonLink>

      <CollectionProvider
        client={client}
        collectionId={collectionId}
        clusterId={clusterId}
      >
        <InstantSearch<DocumentSchema>
          collectionId={collectionId}
          client={client}
          clusterId={clusterId}
          // TODO: need to set initial query by params from default index ??
          // move index above search in component hierarchy ?? pass defaults as prop to InstantSearch ??
        >
          <SearchSlotsProvider
            slots={{
              // stats: Typography, // example (Typography is default component)
              stats: undefined, // hide slot
            }}
            slotProps={{
              stats: { color: 'text.secondary' },
            }}
          >
            <Stack direction='column' spacing={{ xs: 0.5, sm: 1, md: 2 }}>
              <Box>
                <SearchBox sx={{ my: 1 }} />
                {/* <SearchStats /> */}
                <CtxSearchStats />
              </Box>

              {/* <SearchError />
              <Hits /> */}
              <CtxSearchError />
              <ContextHits />

              {/* TODO: slot for toolbar etc */}
              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ButtonLink
                  to='/collections/$collectionId/documents/new'
                  params={{ collectionId }}
                  size='small'
                  startIcon={<AddRounded fontSize='small' />}
                  sx={{ lineHeight: '18px', my: 1 }}
                >
                  Add Documents
                </ButtonLink>
                <Stack
                  direction='row'
                  spacing={2}
                  sx={{
                    flex: '1 1 auto',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  {/* <SearchPageSize />
                  <SearchPagination /> */}
                  <CtxPageSize />
                  <CtxPagination />
                </Stack>
              </Stack>

              <Box>
                <Typography variant='h5' gutterBottom>
                  Search Parameters
                </Typography>
                <Typography component='div' gutterBottom>
                  These settings control ranking, relevance and search
                  fine-tuning. Use a preset to save your configuration, and
                  recall in your application.{' '}
                  <Link
                    href='https://typesense.org/docs/29.0/api/search.html#search-parameters'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Docs
                    <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.5 }} />
                  </Link>
                </Typography>
              </Box>

              <Suspense>
                <Paper id='search-params'>
                  <Container maxWidth='sm' sx={{ py: { xs: 3, sm: 4 } }}>
                    <UpdateSearchParameters collectionId={collectionId} />
                  </Container>
                </Paper>
              </Suspense>

              <Box>
                <Typography variant='h6' gutterBottom>
                  Dashboard Display Options
                </Typography>
                <Typography variant='subtitle2'>
                  These options control the visual display of the results in the
                  search dashboard above
                </Typography>
              </Box>

              <DashboardDisplayOptions />
            </Stack>
          </SearchSlotsProvider>
        </InstantSearch>
      </CollectionProvider>
    </>
  );
}
