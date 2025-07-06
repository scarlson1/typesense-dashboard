import { Container, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import {
  ServerHealth,
  ServerMetrics,
  ServerOps,
  TypesenseMetricsAndNodes,
} from '../../components/serverStatus';

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
          Server Status
        </Typography>
        <ServerHealth />
      </Stack>
      <ServerMetrics />
      <TypesenseMetricsAndNodes />
      <ServerOps />
    </Container>
  );
}
