import { Badge, SectionCard, smallButtonSx } from '@/components/redesign';
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
import { designTokens } from '@/theme/themePrimitives';
import { AddRounded, OpenInNewRounded } from '@mui/icons-material';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search/',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return (
    <Stack sx={{ gap: 2 }}>
      {/* Search bar card */}
      <Box
      // sx={{
      //   backgroundColor: 'background.paper',
      //   border: `1px solid ${designTokens.border}`,
      //   borderRadius: 1,
      //   px: 2,
      //   py: 1.75,
      // }}
      >
        <Stack direction='row' sx={{ gap: 1.25, alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SearchBox sx={{ my: 0 }} />
          </Box>
          <CtxRefinements />
        </Stack>
        <Stack
          direction='row'
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1.25,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <CtxSearchStats />
          {/* <Badge tone='neutral'>fast · indexed</Badge> */}
        </Stack>
      </Box>

      <CtxSearchError />
      <ContextHits />

      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-end', sm: 'center' },
          gap: 1.5,
        }}
      >
        <Button
          component={RouterLink as React.ElementType}
          to='/collections/$collectionId/documents/new'
          params={{ collectionId }}
          size='small'
          variant='outlined'
          startIcon={<AddRounded sx={{ fontSize: 14 }} />}
          sx={smallButtonSx}
        >
          Add documents
        </Button>
        <Stack
          direction='row'
          spacing={2}
          sx={{
            flex: '1 1 auto',
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <CtxPageSize />
          <CtxPagination />
        </Stack>
      </Stack>

      {/* === Search Parameters === */}
      <SectionCard
        title={
          <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
            <Box id='search-params' />
            Search parameters
            <Badge tone='neutral'>applies to this collection</Badge>
          </Stack>
        }
        description={
          <>
            Ranking, relevance, and query fine-tuning. These map 1:1 to
            Typesense search params, so they work with whatever schema your
            collection has. Save a configuration as a preset to recall from your
            application code.{' '}
            <Link
              href='https://typesense.org/docs/29.0/api/search.html#search-parameters'
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                color: designTokens.accent,
                textDecoration: 'none',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Docs
              <OpenInNewRounded fontSize='inherit' />
            </Link>
          </>
        }
      >
        <Suspense
          fallback={
            <Box sx={{ height: 200, background: designTokens.surfaceMuted }} />
          }
        >
          <UpdateSearchParameters
            key={`update-search-${collectionId}`}
            collectionId={collectionId}
          />
        </Suspense>
      </SectionCard>

      {/* === Dashboard Display Options === */}
      <SectionCard
        title='Dashboard display'
        description='Choose which fields render on the result cards above. Preferences are per-collection and persist in your browser — they don’t change the underlying schema.'
      >
        <DashboardDisplayOptions key={`display-opts-${collectionId}`} />
      </SectionCard>

      <Box sx={{ height: 8 }} />
      <Typography
        sx={{
          fontSize: 11.5,
          color: designTokens.textFaint,
          textAlign: 'center',
        }}
      >
        Settings save automatically per collection.
      </Typography>
    </Stack>
  );
}
