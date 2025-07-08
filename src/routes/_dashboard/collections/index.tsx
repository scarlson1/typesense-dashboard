import { ButtonLink, CollectionsGrid, ErrorFallback } from '@/components';
import { Box, Stack, Typography } from '@mui/material';
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
          onError={(error: Error, info) => {
            console.log(error, info);
          }}
        >
          <CollectionsGrid />
        </ErrorBoundary>
      </Box>
    </Box>
  );
}
