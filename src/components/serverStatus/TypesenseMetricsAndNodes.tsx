import { ErrorFallback } from '@/components/ErrorFallback';
import { useTypesenseClient } from '@/hooks';
import { formatBytes, removeStartEndMatches } from '@/utils';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { captureException } from '@sentry/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { isObject, round } from 'lodash-es';
import { Fragment, Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export function TypesenseMetricsAndNodes() {
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
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: Error) => {
              captureException(err);
            }}
          >
            <Suspense>
              <TypesenseMetrics />
            </Suspense>
          </ErrorBoundary>
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: Error) => {
              captureException(err);
            }}
          >
            <Suspense>
              <ServerConfig />
            </Suspense>
          </ErrorBoundary>
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: Error) => {
              captureException(err);
            }}
          >
            <Suspense>
              <ServerStats />
            </Suspense>
          </ErrorBoundary>
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
    staleTime: 1000 * 4,
    refetchInterval: 5000,
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
          <Stack direction='row' spacing={{ xs: 1, sm: 1.5 }} key={key}>
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
    staleTime: 1000 * 4,
    refetchInterval: 5000,
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
    staleTime: 1000 * 4,
    refetchInterval: 5000,
  });

  const [stats, nestedStats] = useMemo(() => {
    const stats = Object.entries(data).filter((s) => !isObject(s[1]));
    const nestedStats = Object.entries(data).filter((s) => isObject(s[1]));

    return [stats, nestedStats];
  }, [data]);

  return (
    <>
      <Typography variant='subtitle1' gutterBottom>
        Server Stats
      </Typography>
      <Stack direction='column' spacing={1}>
        {stats.map(([key, value], i) => (
          <Stack
            direction='row'
            spacing={{ xs: 1, sm: 1.5 }}
            key={`stat-${key}-${i}`}
          >
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ width: 160 }}
            >
              {key.split('_').join(' ')}
            </Typography>
            <Typography>{round(value, 2) ?? '--'}</Typography>
          </Stack>
        ))}

        {nestedStats.map(([key, value], i) => (
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
                  sx={{ width: 160 }}
                >
                  {nestedKey.split('_').join(' ')}
                </Typography>
                <Typography>
                  {!isNaN(nestedVal as number)
                    ? round(nestedVal as number, 2)
                    : '--'}
                </Typography>
              </Stack>
            ))}
          </Fragment>
        ))}

        {/* {Object.entries(data).map(([key, value], i) =>
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
                    sx={{ width: 160 }}
                  >
                    {nestedKey.split('_').join(' ')}
                  </Typography>
                  <Typography>{round(nestedVal, 2) ?? '--'}</Typography>
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
                sx={{ width: 160 }}
              >
                {key.split('_').join(' ')}
              </Typography>
              <Typography>{round(value, 2) ?? '--'}</Typography>
            </Stack>
          )
        )} */}
      </Stack>
    </>
  );
}
