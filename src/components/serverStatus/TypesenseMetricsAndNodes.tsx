import { Box, Paper, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { isObject } from 'lodash-es';
import { Fragment, useMemo } from 'react';
import { useTypesenseClient } from '../../hooks';
import { formatBytes, removeStartEndMatches } from '../../utils';

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
