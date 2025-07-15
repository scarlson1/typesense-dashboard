import { ErrorFallback } from '@/components';
import { ButtonLink } from '@/components/ButtonLink';
import { CollectionsGrid } from '@/components/CollectionsGrid';
import { Box, Stack, Typography } from '@mui/material';
import { captureException } from '@sentry/react';
import { createFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/_dashboard/collections/')({
  component: CollectionsComponent,
  staticData: {
    crumb: 'Collections',
  },
});

function CollectionsComponent() {
  return (
    <Box>
      <Stack
        direction='row'
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant='h3' gutterBottom>
          Collections
        </Typography>
        <ButtonLink to={'/collections/new'} variant='contained'>
          New Collection
        </ButtonLink>
      </Stack>

      <Box sx={{ py: { xs: 1, sm: 2 } }}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: Error) => {
            captureException(err);
          }}
        >
          <CollectionsGrid />
        </ErrorBoundary>
      </Box>
    </Box>
  );
}
