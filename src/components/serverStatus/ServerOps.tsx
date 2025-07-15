import { ErrorFallback } from '@/components';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import { OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export function ServerOps() {
  return (
    <Paper sx={{ my: 2, p: { xs: 2, sm: 3, md: 4 } }}>
      <Stack direction='column' spacing={2}>
        <Typography variant='h6'>Server Operations</Typography>
        <Box>
          <Typography variant='subtitle1' gutterBottom>
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
            onError={(err: Error) => {
              captureException(err);
            }}
          >
            <ClearCache />
          </ErrorBoundary>
        </Box>
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Compact DB
          </Typography>
          <Typography variant='body2' sx={{ pb: 2 }}>
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
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: Error) => {
              captureException(err);
            }}
          >
            <CompactDatabase />
          </ErrorBoundary>
        </Box>
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Schema Updates in Progress
          </Typography>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: Error) => {
              captureException(err);
            }}
          >
            <Suspense>
              <SchemaUpdatesInProgress />
            </Suspense>
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
