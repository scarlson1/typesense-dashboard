import { ButtonLink } from '@/components/ButtonLink';
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
import { UpdateSearchParameters } from '@/components/UpdateSearchParameters';
import {
  AddRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import { Box, Container, Link, Paper, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return (
    <>
      <Stack
        direction='row'
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <ButtonLink
          // to={Route.fullPath}
          to={'.'}
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
            These settings control ranking, relevance and search fine-tuning.
            Use a preset to save your configuration, and recall in your
            application.{' '}
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
    </>
  );
}
