import { CircularProgressWithLabel } from '@/components/CircularProgressWithLabel';
import { LinearProgressWithLabel } from '@/components/LinearProgressWithLabel';
import { SectionCard } from '@/components/redesign';
import { useTypesenseClient } from '@/hooks';
import { formatBytes, removeStartEndMatches } from '@/utils';
import { Box, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ServerHealth } from './ServerHealth';

export function ServerMetrics() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    staleTime: 1000 * 4,
    refetchInterval: 5000,
  });

  const cpuPcts = useMemo(() => {
    // use index when mapping or keep the cpu number from key ??
    return Object.entries(data).filter(([key, _]: string[]) =>
      key.startsWith('system_cpu'),
    );
  }, [data]);

  const megabytesPct = Math.round(
    (Number(data.system_memory_used_bytes) /
      Number(data.system_memory_total_bytes)) *
      100,
  );

  const megabytesPctDisk = Math.round(
    (Number(data.system_disk_used_bytes) /
      Number(data.system_disk_total_bytes)) *
      100,
  );

  return (
    <SectionCard
      title='Server Metrics'
      actions={
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <ServerHealth />
          </Suspense>
        </ErrorBoundary>
      }
    >
      <Stack
        direction='row'
        spacing={{ xs: 1, sm: 1.5, md: 2 }}
        // sx={{ py: { xs: 1, sm: 2, md: 2.5 }, justifyContent: 'space-between' }}
        useFlexGap
        sx={{ py: { xs: 1, sm: 2, md: 2.5 }, flexWrap: 'wrap' }}
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
                '_active_percentage',
              )}
            </Typography>
            <CircularProgressWithLabel value={Number(val)} size={48} />
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
          value={megabytesPctDisk}
        />
      </Box>
      <Box>
        <Typography variant='overline' gutterBottom>
          System Network
        </Typography>
        <Typography>{`Received: ${formatBytes(Number(data.system_network_received_bytes))}; Sent: ${formatBytes(Number(data.system_network_sent_bytes))}`}</Typography>
      </Box>
    </SectionCard>
  );
}
