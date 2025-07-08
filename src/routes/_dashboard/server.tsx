import {
  ServerMetrics,
  ServerOps,
  TypesenseMetricsAndNodes,
} from '@/components/serverStatus';
import { Container, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/server')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container maxWidth='md' disableGutters>
      <Typography variant='h3' gutterBottom>
        Overview
      </Typography>
      <ServerMetrics />
      <TypesenseMetricsAndNodes />
      <ServerOps />
    </Container>
  );
}
