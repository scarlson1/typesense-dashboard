import { ErrorFallback } from '@/components';
import { dangerButtonSx } from '@/components/redesign';
import { useAsyncToast, useDialog, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import { OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export function ServerOps() {
  return (
    <Stack direction='column' spacing={2}>
      <Box>
        <Typography
          variant='subtitle1'
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            color: 'text.faint',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          gutterBottom
        >
          Cache
        </Typography>
        <Typography variant='body2' sx={{ pb: 2 }}>
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
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => {
            captureException(err);
          }}
        >
          <ClearCache />
        </ErrorBoundary>
      </Box>
      <Box>
        <Typography
          variant='subtitle1'
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            color: 'text.faint',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          gutterBottom
        >
          Compact DB
        </Typography>
        <Typography variant='body2' sx={{ pb: 2 }}>
          Typesense uses RocksDB to store your documents on the disk. Compacting
          could reduce the size of the database and decrease read latency.{' '}
          <Link
            href='https://typesense.org/docs/29.0/api/cluster-operations.html#compacting-the-on-disk-database'
            target='_blank'
            rel='noopener noreferrer'
          >
            Docs <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
          </Link>
        </Typography>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => {
            captureException(err);
          }}
        >
          <CompactDatabase />
        </ErrorBoundary>
      </Box>
      <Box>
        <Typography
          variant='subtitle1'
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            color: 'text.faint',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          gutterBottom
        >
          Snapshot
        </Typography>
        <Typography variant='body2' sx={{ pb: 2 }}>
          Create a point-in-time backup of the database on the server's disk at
          the path you specify.{' '}
          <Link
            href='https://typesense.org/docs/29.0/api/cluster-operations.html#create-snapshot-for-backups'
            target='_blank'
            rel='noopener noreferrer'
          >
            Docs <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
          </Link>
        </Typography>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => {
            captureException(err);
          }}
        >
          <CreateSnapshot />
        </ErrorBoundary>
      </Box>
      <Box>
        <Typography
          variant='subtitle1'
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            color: 'text.faint',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          gutterBottom
        >
          Re-election
        </Typography>
        <Typography variant='body2' sx={{ pb: 2 }}>
          Trigger a leader re-election within the cluster. This is disruptive and
          rarely needed — only run it when recovering a degraded cluster.{' '}
          <Link
            href='https://typesense.org/docs/29.0/api/cluster-operations.html#re-elect-leader'
            target='_blank'
            rel='noopener noreferrer'
          >
            Docs <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
          </Link>
        </Typography>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => {
            captureException(err);
          }}
        >
          <TriggerVote />
        </ErrorBoundary>
      </Box>
      <Box>
        <Typography
          variant='subtitle1'
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            color: 'text.faint',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          gutterBottom
        >
          Runtime Config
        </Typography>
        <Typography variant='body2' sx={{ pb: 2 }}>
          Update select runtime settings without restarting the server. These
          values are write-only — Typesense has no endpoint to read them back.{' '}
          <Link
            href='https://typesense.org/docs/29.0/api/cluster-operations.html#toggle-slow-request-log'
            target='_blank'
            rel='noopener noreferrer'
          >
            Docs <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
          </Link>
        </Typography>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => {
            captureException(err);
          }}
        >
          <RuntimeConfig />
        </ErrorBoundary>
      </Box>
      <Box>
        <Typography variant='subtitle1' gutterBottom>
          Schema Updates in Progress
        </Typography>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => {
            captureException(err);
          }}
        >
          <Suspense>
            <SchemaUpdatesInProgress />
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Stack>
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

function CreateSnapshot() {
  const toast = useAsyncToast();
  const [client] = useTypesenseClient();
  const [snapshotPath, setSnapshotPath] = useState('');

  const mutation = useMutation({
    mutationFn: (path: string) =>
      client.operations.perform('snapshot', { snapshot_path: path }),
    onMutate: () => {
      toast.loading(`creating snapshot...`, { id: 'snapshot' });
    },
    onSuccess: () => {
      toast.success(`snapshot created`, { id: 'snapshot' });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || `error creating snapshot`, { id: 'snapshot' });
    },
  });

  const path = snapshotPath.trim();

  return (
    <Stack direction='row' spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <TextField
        value={snapshotPath}
        onChange={(e) => setSnapshotPath(e.target.value)}
        placeholder='/tmp/typesense-data-snapshot'
        size='small'
        fullWidth
        sx={{ maxWidth: 360 }}
      />
      <Button
        variant='contained'
        onClick={() => mutation.mutate(path)}
        loading={mutation.isPending}
        disabled={!path}
      >
        Create Snapshot
      </Button>
    </Stack>
  );
}

function TriggerVote() {
  const toast = useAsyncToast();
  const dialog = useDialog();
  const [client] = useTypesenseClient();

  const mutation = useMutation({
    mutationFn: () => client.operations.perform('vote'),
    onMutate: () => {
      toast.loading(`triggering re-election...`, { id: 'vote' });
    },
    onSuccess: () => {
      toast.success(`re-election triggered`, { id: 'vote' });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || `error triggering re-election`, { id: 'vote' });
    },
  });

  const handleClick = async () => {
    try {
      await dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: 'Trigger leader re-election?',
        description:
          'This forces a new leader election across the cluster and can briefly disrupt reads and writes. Only proceed when recovering a degraded cluster.',
        slotProps: { dialog: { maxWidth: 'sm' } },
      });
      mutation.mutate();
    } catch {
      // cancelled
    }
  };

  return (
    <Button
      variant='outlined'
      onClick={handleClick}
      loading={mutation.isPending}
      sx={dangerButtonSx}
    >
      Trigger Re-election
    </Button>
  );
}

function RuntimeConfig() {
  const toast = useAsyncToast();
  const [client] = useTypesenseClient();
  const [slowMs, setSlowMs] = useState('');

  const mutation = useMutation({
    mutationFn: (value: number) =>
      client.apiCall.post('/config', {
        'log-slow-requests-time-ms': value,
      }),
    onMutate: () => {
      toast.loading(`updating config...`, { id: 'config' });
    },
    onSuccess: () => {
      toast.success(`config updated`, { id: 'config' });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || `error updating config`, { id: 'config' });
    },
  });

  const trimmed = slowMs.trim();
  const parsed = Number(trimmed);
  const isValid = trimmed !== '' && Number.isInteger(parsed);

  return (
    <Stack direction='row' spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <TextField
        type='number'
        value={slowMs}
        onChange={(e) => setSlowMs(e.target.value)}
        label='log-slow-requests-time-ms'
        placeholder='-1 to disable'
        helperText='Log requests slower than this many ms. -1 disables.'
        size='small'
        sx={{ maxWidth: 360, width: '100%' }}
      />
      <Button
        variant='contained'
        onClick={() => mutation.mutate(parsed)}
        loading={mutation.isPending}
        disabled={!isValid}
      >
        Update Config
      </Button>
    </Stack>
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
    staleTime: 1000 * 4,
    refetchInterval: 5000,
  });

  return Boolean(data?.length) ? (
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
