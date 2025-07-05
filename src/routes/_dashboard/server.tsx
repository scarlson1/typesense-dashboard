import { OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Typography,
  type LinearProgressProps,
} from '@mui/material';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { isObject } from 'lodash-es';
import { Fragment, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../components';
import { useAsyncToast, useTypesenseClient } from '../../hooks';
import { formatBytes, queryClient, removeStartEndMatches } from '../../utils';

export const Route = createFileRoute('/_dashboard/server')({
  component: RouteComponent,
});

function RouteComponent() {
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

function ServerHealth() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'health'],
    queryFn: () => client.health.retrieve(),
    staleTime: 1000 * 5,
  });

  // @ts-ignore
  const chipLabel = data.ok ? 'healthy' : (data.resource_error ?? 'Down');

  return (
    <Box>
      {/* <Typography variant='overline' component='div'>
        Server Health
      </Typography> */}
      <Chip
        label={chipLabel}
        color={data.ok ? 'success' : 'warning'}
        size='small'
      />
    </Box>
  );
}

function ServerMetrics() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    staleTime: 1000 * 5,
  });

  const cpuPcts = useMemo(() => {
    // use index when mapping or keep the cpu number from key ??
    return Object.entries(data).filter(([key, _]: string[]) =>
      key.startsWith('system_cpu')
    );
  }, [data]);

  const megabytesPct = Math.round(
    (Number(data.system_memory_used_bytes) /
      Number(data.system_memory_total_bytes)) *
      100
  );

  return (
    <Paper sx={{ my: 2, p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant='h6' gutterBottom>
        Server Metrics
      </Typography>

      <Stack
        direction='row'
        spacing={{ xs: 1, sm: 1.5, md: 2 }}
        sx={{ py: { xs: 1, sm: 2, md: 2.5 }, justifyContent: 'space-between' }}
      >
        {cpuPcts.map(([id, val]: [string, string]) => (
          <Stack
            direction='column'
            spacing={{ xs: 1, sm: 1.5 }}
            sx={{ alignItems: 'center' }}
            key={id}
          >
            <Typography variant='body2' color='text.secondary'>
              {removeStartEndMatches(
                removeStartEndMatches(id, 'system_'),
                '_active_percentage'
              )}
            </Typography>
            <CircularProgressWithLabel val={Number(val)} />
          </Stack>
        ))}
      </Stack>

      <Box sx={{ py: 1 }}>
        <Typography variant='overline' gutterBottom>
          Memory
        </Typography>
        <LinearProgressWithLabel
          label={`${formatBytes(Number(data.system_memory_used_bytes))}`}
          labelTotal={`${formatBytes(Number(data.system_memory_total_bytes))}`}
          value={megabytesPct}
        />
      </Box>
      <Box sx={{ py: 1 }}>
        <Typography variant='overline' gutterBottom>
          Disk
        </Typography>
        <LinearProgressWithLabel
          label={`${formatBytes(Number(data.system_disk_used_bytes))}`}
          labelTotal={`${formatBytes(Number(data.system_disk_total_bytes))}`}
          value={megabytesPct}
        />
      </Box>
      <Box>
        <Typography variant='overline' gutterBottom>
          System Network
        </Typography>
        <Typography>{`Received: ${formatBytes(Number(data.system_network_received_bytes))}; Sent: ${formatBytes(Number(data.system_network_sent_bytes))}`}</Typography>
      </Box>
    </Paper>
  );
}

function CircularProgressWithLabel({ val }: { val: number }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Box sx={{ position: 'relative', display: 'grid' }}>
        <CircularProgress
          variant='determinate'
          value={Number(val)}
          sx={{
            zIndex: 2,
            gridColumn: 1,
            gridRow: 1,
          }}
        />
        <CircularProgress
          variant='determinate'
          value={100}
          color='secondary'
          sx={{
            opacity: 0.25,
            gridColumn: 1,
            gridRow: 1,
            zIndex: 1,
          }}
        />
      </Box>
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant='caption'
          component='div'
          sx={{ color: 'text.secondary' }}
        >{`${Number(val)}%`}</Typography>
      </Box>
    </Box>
  );
}

function LinearProgressWithLabel({
  label,
  labelTotal,
  value,
  ...props
}: LinearProgressProps & { value: number; label: string; labelTotal: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <Box sx={{ width: '100%', mr: 1, position: 'relative' }}>
          <LinearProgress
            variant='determinate'
            value={value}
            {...props}
            sx={{ height: 24, borderRadius: 1 }}
          />
          {/* TODO: fix label position */}
          <Chip
            label={label}
            variant='filled'
            size='small'
            color='secondary'
            sx={{
              position: 'absolute',
              left: `${isNaN(value) ? 50 : value}%`,
              top: '50%',
              transform: `translate(-50%, -50%)`,
            }}
          />
        </Box>
      </Box>
      <Box sx={{ minWidth: 72 }}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {labelTotal}
        </Typography>
      </Box>
    </Box>
  );
}

function TypesenseMetricsAndNodes() {
  return (
    <Paper sx={{ my: 2, p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant='h6' gutterBottom>
        Typesense
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap' }}
      >
        <Box sx={{ flex: '1 1 auto' }}>
          <TypesenseMetrics />
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <ServerConfig />
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <ServerStats />
        </Box>
      </Stack>
    </Paper>
  );
}

function TypesenseMetrics() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    staleTime: 1000 * 5,
  });

  const values = useMemo<[string, number | string][]>(() => {
    // use index when mapping or keep the cpu number from key ??
    let typesenseData = Object.entries(data).filter(([key, _]: string[]) =>
      key.startsWith('typesense_memory')
    );

    return typesenseData.map(([key, val]) => {
      let num = Number(val);
      let formatted = key.endsWith('bytes') ? formatBytes(num) : num;
      return [removeStartEndMatches(key, 'typesense_memory_'), formatted];
    });
  }, [data]);

  return (
    <>
      <Typography variant='subtitle1' gutterBottom>
        Memory
      </Typography>
      <Stack direction='column' spacing={{ xs: 1 }}>
        {values.map(([key, val]) => (
          <Stack
            direction='row'
            spacing={{ xs: 1, sm: 1.5 }}
            // sx={{ alignItems: 'center' }}
            key={key}
          >
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ width: 128 }}
            >
              {removeStartEndMatches(key, '_bytes').split('_').join(' ')}
            </Typography>
            <Typography>{val}</Typography>
          </Stack>
        ))}
      </Stack>
    </>
  );
}

function ServerConfig() {
  const [client, clientId] = useTypesenseClient();
  const { data: nodes } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'config', 'nodes'],
    queryFn: () => client.configuration.nodes,
    staleTime: 1000 * 5,
  });

  return (
    <>
      <Typography variant='subtitle1' gutterBottom>
        Server Config (nodes)
      </Typography>

      <Stack direction='column' spacing={1}>
        {nodes.map((node, i) => (
          <Fragment key={`node-${i}`}>
            <Typography
              variant='subtitle2'
              gutterBottom
            >{`Node ${i + 1}`}</Typography>
            {Object.entries(node).map(([key, val]) => (
              <Stack
                direction='row'
                spacing={{ xs: 1, sm: 1.5 }}
                // sx={{ alignItems: 'center' }}
                key={`node-${i}-${key}`}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ width: 128 }}
                >
                  {removeStartEndMatches(key, '_bytes').split('_').join(' ')}
                </Typography>
                <Typography>{val ?? '--'}</Typography>
              </Stack>
            ))}
          </Fragment>
        ))}
      </Stack>
    </>
  );
}

function ServerStats() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'stats'],
    queryFn: () => client.stats.retrieve(),
    staleTime: 1000 * 5,
  });

  return (
    <>
      <Typography variant='subtitle1' gutterBottom>
        Server Stats
      </Typography>
      <Stack direction='column' spacing={1}>
        {Object.entries(data).map(([key, value], i) =>
          isObject(value) ? (
            <Fragment key={`stat-${key}-${i}`}>
              <Typography variant='overline'>
                {key.split('_').join(' ')}
              </Typography>
              {Object.entries(value).map(([nestedKey, nestedVal]) => (
                <Stack
                  direction='row'
                  spacing={{ xs: 1, sm: 1.5 }}
                  key={`stat-${key}-${i}-${nestedKey}`}
                >
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ width: 128 }}
                  >
                    {key.split('_').join(' ')}
                  </Typography>
                  <Typography>{nestedVal ?? '--'}</Typography>
                </Stack>
              ))}
            </Fragment>
          ) : (
            <Stack
              direction='row'
              spacing={{ xs: 1, sm: 1.5 }}
              key={`stat-${key}-${i}`}
            >
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ width: 128 }}
              >
                {key.split('_').join(' ')}
              </Typography>
              <Typography>{value ?? '--'}</Typography>
            </Stack>
          )
        )}
      </Stack>
    </>
  );
}

function ServerOps() {
  return (
    <Paper sx={{ my: 2, p: { xs: 2, sm: 3, md: 4 } }}>
      <Stack direction='column' spacing={2}>
        <Typography variant='h6'>Server Operations</Typography>
        <Box>
          <Typography variant='subtitle1'>Cache</Typography>
          <Typography variant='body2' gutterBottom>
            Responses of search requests that are sent with use_cache parameter
            are cached in a LRU cache{' '}
            <Link
              href='https://typesense.org/docs/29.0/api/cluster-operations.html#clear-cache'
              target='_blank'
              rel='noopener noreferrer'
            >
              Docs <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
            </Link>
          </Typography>
          <ClearCache />
        </Box>
        <Box>
          <Typography variant='subtitle1'>Compact DB</Typography>
          <Typography variant='body2' gutterBottom>
            Typesense uses RocksDB to store your documents on the disk.
            Compacting could reduce the size of the database and decrease read
            latency.{' '}
            <Link
              href='https://typesense.org/docs/29.0/api/cluster-operations.html#compacting-the-on-disk-database'
              target='_blank'
              rel='noopener noreferrer'
            >
              Docs <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
            </Link>
          </Typography>
          <CompactDatabase />
        </Box>
        <Box>
          <Typography variant='subtitle1'>
            Schema Updates in Progress
          </Typography>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <SchemaUpdatesInProgress />
          </ErrorBoundary>
        </Box>
      </Stack>
    </Paper>
  );
}

function ClearCache() {
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
    <Button
      variant='contained'
      onClick={() => mutation.mutate()}
      loading={mutation.isPending}
    >
      Clear Cache
    </Button>
  );
}

function CompactDatabase() {
  const toast = useAsyncToast();
  const [client] = useTypesenseClient();

  const mutation = useMutation({
    mutationFn: () => client.apiCall.post('/operations/db/compact'),
    onMutate: () => {
      toast.loading(`compacting DB...`, { id: 'cache' });
    },
    onSuccess: () => {
      toast.success(`compact DB operation complete`, { id: 'cache' });
    },
    onError: (err) => {
      console.log(err);
      toast.error(`error compacting DB`, { id: 'cache' });
    },
  });

  return (
    <Button
      variant='contained'
      onClick={() => mutation.mutate()}
      loading={mutation.isPending}
    >
      Compact Database
    </Button>
  );
}

interface SchemaUpdate {
  collection: string;
  validated_docs: number;
  altered_docs: number;
}

function SchemaUpdatesInProgress() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery<SchemaUpdate[]>({
    queryKey: [clientId, 'operations', 'schemaChanges'],
    queryFn: () => client.apiCall.get('/operations/schema_changes'), // client.operations.perform('schema_changes'),
    staleTime: 1000 * 5,
  });

  return Boolean(data.length) ? (
    <>
      {data.map((update) => (
        <Grid container columnSpacing={2} rowSpacing={1}>
          {Object.entries(update).map(([key, val]) => (
            <Grid>
              <Typography variant='body2' color='text.secondary'>
                {key}
              </Typography>
              <Typography>{val}</Typography>
            </Grid>
          ))}
        </Grid>
      ))}
    </>
  ) : (
    <Typography>No updates in progress</Typography>
  );
}
