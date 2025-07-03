import { Alert, Box, Button, Typography } from '@mui/material';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useAsyncToast, useTypesenseClient } from '../../hooks';
import { queryClient } from '../../utils';

export const Route = createFileRoute('/_dashboard/server')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Box>
      <Typography variant='h3' gutterBottom>
        Server Status
      </Typography>
      <Alert severity='warning' sx={{ my: 2 }}>
        TODO: server stats & config
      </Alert>
      <ServerHealth />
      <ServerConfig />
      <ServerStats />
      <ServerMetrics />
      <ServerOps />
      <SchemaUpdatesInProgress />
    </Box>
  );
}

function SchemaUpdatesInProgress() {
  return <Typography>TODO: In progress schema updates</Typography>;
}

function ServerConfig() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'config'],
    queryFn: () => client.configuration.nodes,
    staleTime: 1000 * 5 * 20,
  });

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant='h6' gutterBottom>
        Server Config (nodes)
      </Typography>
      <Typography component='div' variant='body2' color='textSecondary'>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Typography>
    </Box>
  );
}

function ServerHealth() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'health'],
    queryFn: () => client.health.retrieve(),
    staleTime: 1000 * 5 * 20,
  });

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant='h6' gutterBottom>
        Server Health
      </Typography>
      <Typography component='div' variant='body2' color='textSecondary'>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Typography>
    </Box>
  );
}

function ServerStats() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'stats'],
    queryFn: () => client.stats.retrieve(),
    staleTime: 1000 * 5 * 20,
  });

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant='h6' gutterBottom>
        Server Stats
      </Typography>
      <Typography component='div' variant='body2' color='textSecondary'>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Typography>
    </Box>
  );
}

function ServerMetrics() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    staleTime: 1000 * 5 * 20,
  });

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant='h6' gutterBottom>
        Server Metrics
      </Typography>
      <Typography component='div' variant='body2' color='textSecondary'>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Typography>
    </Box>
  );
}

function ServerOps() {
  const toast = useAsyncToast();
  const [client, clientId] = useTypesenseClient();

  const mutation = useMutation({
    mutationFn: () => client.operations.perform('cache/clear'),
    onMutate: () => {
      toast.loading(`clearing cache...`, { id: 'cache' });
    },
    onSuccess: () => {
      toast.success(`cache cleared`, { id: 'cache' });
    },
    onError: (err) => {
      console.log(err);
      toast.error(`error clearing cache`, { id: 'cache' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [clientId],
      });
    },
  });

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant='h6' gutterBottom>
        Server Operations
      </Typography>
      <Button variant='contained' onClick={() => mutation.mutate()}>
        Clear Cache
      </Button>
    </Box>
  );
}
