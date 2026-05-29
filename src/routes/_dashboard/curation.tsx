import { ErrorFallback } from '@/components';
import { CurationListV30 } from '@/components/CurationListV30';
import { PageHeader, smallButtonSx } from '@/components/redesign';
import { useTypesenseVersion } from '@/hooks/useTypesenseVersion';
import { designTokens } from '@/theme/themePrimitives';
import { OpenInNewRounded } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Stack } from '@mui/material';
import { captureException } from '@sentry/react';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/_dashboard/curation')({
  component: RouteComponent,
});

function RouteComponent() {
  const { is30Plus, raw } = useTypesenseVersion();

  if (!is30Plus) {
    return (
      <Alert severity='warning'>
        <AlertTitle>Version mismatch</AlertTitle>
        {`Current version is ${raw}. This view is for v30+. Use the Curation view under the collection menu.`}
      </Alert>
    );
  }

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Curation rules'
        // badges={<Badge tone='neutral'>{collectionId}</Badge>}
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/30.0/api/curation.html'
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
      {/* <CollectionTabBar collectionId={collectionId} /> */}

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
            <CurationListV30 />
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Stack>
  );
}
