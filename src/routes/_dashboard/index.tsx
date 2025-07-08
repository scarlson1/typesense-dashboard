import { ButtonLink, ErrorFallback } from '@/components';
import {
  ServerMetrics,
  ServerOps,
  TypesenseMetricsAndNodes,
} from '@/components/serverStatus';
import { Container, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// TODO: suspense / loading skeletons

export const Route = createFileRoute('/_dashboard/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <Container maxWidth='md' disableGutters>
      <Stack
        direction='row'
        spacing={2}
        sx={{ justifyContent: 'space-between' }}
      >
        <Typography variant='h3' gutterBottom>
          Overview
        </Typography>
        <ButtonLink to='/keys' variant='contained' size='small'>
          Generate API Keys
        </ButtonLink>
      </Stack>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense>
          <ServerMetrics />
        </Suspense>
      </ErrorBoundary>
      <TypesenseMetricsAndNodes />
      <ServerOps />
    </Container>
  );
}
