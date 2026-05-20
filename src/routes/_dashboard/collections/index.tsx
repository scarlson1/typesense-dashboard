import { ErrorFallback } from '@/components';
import { CollectionsGrid } from '@/components/CollectionsGrid';
import {
  Badge,
  PageHeader,
  StatCard,
  smallButtonSx,
  primaryButtonSx,
} from '@/components/redesign';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { formatBytes } from '@/utils';
import {
  AddRounded,
  DownloadRounded,
} from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { captureException } from '@sentry/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/_dashboard/collections/')({
  component: CollectionsComponent,
  staticData: { crumb: 'Collections' },
});

function CollectionsComponent() {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(err: unknown) => captureException(err)}
      >
        <Suspense fallback={<CollectionsHeader count={0} />}>
          <CollectionsHeaderConnected />
        </Suspense>
      </ErrorBoundary>

      <Box
        sx={{
          flex: 1,
          px: { xs: 3, md: 4 },
          py: 2.5,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => captureException(err)}
        >
          <Suspense fallback={<StatStripFallback />}>
            <StatStrip />
          </Suspense>
        </ErrorBoundary>

        <Box
          sx={{
            background: 'background.paper',
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: unknown) => captureException(err)}
          >
            <CollectionsGrid />
          </ErrorBoundary>
        </Box>
      </Box>
    </Stack>
  );
}

function CollectionsHeaderConnected() {
  const [client, clientId] = useTypesenseClient();
  const { data: collections } = useSuspenseQuery({
    queryKey: [clientId, 'collections', 'list'],
    queryFn: () => client.collections().retrieve(),
  });
  return <CollectionsHeader count={collections.length} />;
}

function CollectionsHeader({ count }: { count: number }) {
  return (
    <PageHeader
      title='Collections'
      badges={
        <Badge tone='neutral'>
          {count} collection{count === 1 ? '' : 's'}
        </Badge>
      }
      actions={
        <>
          <Button
            variant='outlined'
            size='small'
            startIcon={<DownloadRounded sx={{ fontSize: 14 }} />}
            sx={smallButtonSx}
          >
            Backup
          </Button>
          <Button
            component={RouterLink as React.ElementType}
            to='/collections/new'
            variant='contained'
            size='small'
            startIcon={<AddRounded sx={{ fontSize: 14 }} />}
            sx={primaryButtonSx}
          >
            New collection
          </Button>
        </>
      }
    />
  );
}

function StatStripFallback() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gap: 1.25,
        mb: 2.25,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            background: 'background.paper',
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1,
            height: 92,
          }}
        />
      ))}
    </Box>
  );
}

function StatStrip() {
  const [client, clientId] = useTypesenseClient();
  const { data: collections } = useSuspenseQuery({
    queryKey: [clientId, 'collections', 'list'],
    queryFn: () => client.collections().retrieve(),
  });
  const { data: metrics } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    refetchInterval: 5000,
  });
  const { data: stats } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'stats'],
    queryFn: () => client.stats.retrieve(),
    refetchInterval: 5000,
  });
  const totalDocs = collections.reduce(
    (a, c) => a + (c.num_documents ?? 0),
    0,
  );
  const diskUsed = Number(metrics.system_disk_used_bytes ?? 0);
  const diskTotal = Number(metrics.system_disk_total_bytes ?? 0);
  const latencyMs = (stats as { latency_ms?: Record<string, number> })
    .latency_ms;
  const latency =
    Number(latencyMs?.['search'] ?? latencyMs?.['total'] ?? 0) || 0;
  const qps =
    Number((stats as Record<string, number>).total_requests_per_second ?? 0) ||
    0;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gap: 1.25,
        mb: 2.25,
      }}
    >
      <StatCard
        label='Total documents'
        value={totalDocs.toLocaleString()}
        sub={`across ${collections.length} collections`}
      />
      <StatCard
        label='Storage used'
        value={formatBytes(diskUsed)}
        sub={`of ${formatBytes(diskTotal)} allocated`}
      />
      <StatCard
        label='Avg search latency'
        value={latency ? latency.toFixed(1) : '—'}
        unit=' ms'
        sub='p95 over last 24h'
        delta='healthy'
        deltaPositive
      />
      <StatCard
        label='Search QPS'
        value={qps.toFixed(1)}
        sub='requests/sec'
      />
    </Box>
  );
}

