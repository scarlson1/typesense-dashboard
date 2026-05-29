import { ErrorFallback } from '@/components';
import { CurationList } from '@/components/CurationList';
import {
  Badge,
  CollectionTabBar,
  MobileCollectionScopeStrip,
  PageHeader,
  smallButtonSx,
} from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { captureException } from '@sentry/react';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/curation',
)({
  component: RouteComponent,
  staticData: { crumb: 'Curation' },
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Curation rules'
        badges={<Badge tone='neutral'>{collectionId}</Badge>}
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/curation.html'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            Docs
          </Button>
        }
      />
      <CollectionTabBar collectionId={collectionId} />

      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => captureException(err)}
        >
          <Suspense>
            <CurationList collectionId={collectionId} />
          </Suspense>
        </ErrorBoundary>
      </Box>
      <MobileCollectionScopeStrip currentCollectionId={collectionId} />
    </Stack>
  );
}
