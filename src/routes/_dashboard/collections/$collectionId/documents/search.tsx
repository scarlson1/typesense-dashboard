import { ButtonLink } from '@/components/ButtonLink';
import { CollectionProvider } from '@/components/CollectionProvider';
import { InstantSearch } from '@/components/InstantSearch';
import {
  ContextHits,
  CtxPageSize,
  CtxPagination,
  CtxRefinements,
  CtxSearchError,
  CtxSearchStats,
  DashboardDisplayOptions,
  SearchBox,
} from '@/components/search';
import { SearchSlotsProvider } from '@/components/search/SearchSlotsProvider';
import { UpdateSearchParameters } from '@/components/UpdateSearchParameters';
import { useTypesenseClient } from '@/hooks';
import {
  AddRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

// TODO: reset display options when collection changes

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

      <CollectionProvider
        client={client}
        collectionId={collectionId}
        clusterId={clusterId}
      >
        <InstantSearch<DocumentSchema>
          collectionId={collectionId}
          client={client}
          clusterId={clusterId}
        >
          <SearchSlotsProvider
            slots={{
              hits: Grid,
              hitWrapper: Grid,
            }}
            slotProps={{
              stats: { color: 'text.secondary' },
              hits: { container: true, spacing: 2 },
              hitActions: {
                sx: {
                  position: 'absolute',
                  right: '8px',
                  top: '8px',
                  // backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                  bgcolor: 'background.paper',
                  opacity: 0.8,
                  backdropFilter: 'blur(8px) opacity(0.87)',
                },
              },
            }}
          >
            <Stack
              direction='row'
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <ButtonLink
                // from={Route.fullPath}
                to={Route.fullPath}
                params={{ collectionId }}
                hash='search-params'
                endIcon={<ExpandMoreRounded />}
                size='small'
              >
                Search Parameters
              </ButtonLink>
              <CtxRefinements />
            </Stack>

            <Stack direction='column' spacing={{ xs: 0.5, sm: 1, md: 2 }}>
              <Box>
                <SearchBox sx={{ my: 1 }} />
                {/* <SearchStats /> */}
                <CtxSearchStats />
              </Box>
              <CtxSearchError />
              <ContextHits />

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
                  <CtxPageSize />
                  <CtxPagination />
                </Stack>
              </Stack>

              <Box>
                <Typography variant='h5' gutterBottom id='search-params'>
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
                <Paper>
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
