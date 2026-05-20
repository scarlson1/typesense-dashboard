import { ErrorFallback } from '@/components';
import {
  Badge,
  BigChart,
  PageHeader,
  primaryButtonSx,
  SectionCard,
  smallButtonSx,
  StatCard,
} from '@/components/redesign';
import {
  ServerMetrics,
  ServerOps,
  TypesenseMetricsAndNodes,
} from '@/components/serverStatus';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { formatBytes } from '@/utils';
import {
  DownloadRounded,
  SettingsRounded,
} from '@mui/icons-material';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { captureException } from '@sentry/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/_dashboard/server')({
  component: RouteComponent,
  staticData: { crumb: 'Server status' },
});

function RouteComponent() {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(err: unknown) => captureException(err)}
      >
        <Suspense fallback={<ServerHeader />}>
          <ServerHeaderConnected />
        </Suspense>
      </ErrorBoundary>
      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 3,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => captureException(err)}
        >
          <Suspense fallback={<TopStripFallback />}>
            <TopStrip />
          </Suspense>
        </ErrorBoundary>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
            gap: 1.75,
            mt: 1.75,
          }}
        >
          <SectionCard
            title='Requests per second'
            description='Search · Import · Delete · Write — last 24 hours'
          >
            <BigChart />
            <Stack
              direction='row'
              sx={{
                gap: 2,
                mt: 1,
                fontSize: 11.5,
                color: designTokens.textMuted,
                flexWrap: 'wrap',
              }}
            >
              <Legend color={designTokens.accent}>Search</Legend>
              <Legend color='#3aafe0'>Import</Legend>
              <Legend color='#f6b500'>Write</Legend>
              <Legend color={designTokens.textSubtle}>Delete</Legend>
            </Stack>
          </SectionCard>

          <Stack sx={{ gap: 1.75, minWidth: 0 }}>
            <ServerMetrics />
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(err: unknown) => captureException(err)}
            >
              <Suspense fallback={null}>
                <TypesenseMetricsAndNodes />
              </Suspense>
            </ErrorBoundary>
          </Stack>
        </Box>

        <Box sx={{ mt: 1.75 }}>
          <SectionCard title='Operations'>
            <ServerOps />
          </SectionCard>
        </Box>
      </Box>
    </Stack>
  );
}

function ServerHeaderConnected() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'debug'],
    queryFn: () => client.debug.retrieve(),
    staleTime: 1000 * 300,
  });
  const node = client.configuration.nodes[0] as
    | { host?: string; url?: string; port?: number }
    | undefined;
  return (
    <ServerHeader
      host={node?.host ?? node?.url ?? '—'}
      port={node?.port}
      version={data?.version ?? '—'}
    />
  );
}

function ServerHeader({
  host = '—',
  port,
  version = '—',
}: {
  host?: string;
  port?: number;
  version?: string;
} = {}) {
  return (
    <PageHeader
      title='Cluster overview'
      eyebrow={`NODE-1 · ${host}${port ? `:${port}` : ''}`}
      badges={
        <>
          <Badge tone='success'>● Healthy</Badge>
          <Badge tone='neutral'>v{version}</Badge>
        </>
      }
      actions={
        <>
          <Button
            variant='outlined'
            size='small'
            startIcon={<DownloadRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            Snapshot
          </Button>
          <Button
            variant='contained'
            size='small'
            startIcon={<SettingsRounded sx={{ fontSize: 13 }} />}
            sx={primaryButtonSx}
          >
            Configuration
          </Button>
        </>
      }
    />
  );
}

function TopStripFallback() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 1.25,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant='rounded'
          height={92}
          sx={{ background: designTokens.surfaceMuted }}
        />
      ))}
    </Box>
  );
}

function TopStrip() {
  const [client, clientId] = useTypesenseClient();
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

  const qps =
    Number((stats as Record<string, number>).total_requests_per_second ?? 0) ||
    0;
  const latencyMs = (stats as { latency_ms?: Record<string, number> })
    .latency_ms;
  const latency =
    Number(latencyMs?.['search'] ?? latencyMs?.['total'] ?? 0) || 0;
  const memUsed = Number(metrics.system_memory_used_bytes ?? 0);
  const memTotal = Number(metrics.system_memory_total_bytes ?? 0);
  const memPct = memTotal ? memUsed / memTotal : 0;
  const diskUsed = Number(metrics.system_disk_used_bytes ?? 0);
  const diskTotal = Number(metrics.system_disk_total_bytes ?? 0);
  const diskPct = diskTotal ? diskUsed / diskTotal : 0;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 1.25,
      }}
    >
      <StatCard
        label='Search QPS'
        value={qps.toFixed(1)}
        sub='requests/sec'
        delta='+8.4%'
        deltaPositive
      />
      <StatCard
        label='p95 latency'
        value={latency ? latency.toFixed(1) : '—'}
        unit=' ms'
        sub='last 5 min'
        delta='-1.2 ms'
        deltaPositive
      />
      <StatCard
        label='Memory'
        value={formatBytes(memUsed)}
        sub={`of ${formatBytes(memTotal)}`}
      >
        <Box
          sx={{
            height: 4,
            background: designTokens.surfaceMuted,
            borderRadius: '2px',
            mb: 0.75,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${memPct * 100}%`,
              height: '100%',
              background: designTokens.accent,
              borderRadius: '2px',
            }}
          />
        </Box>
      </StatCard>
      <StatCard
        label='Disk'
        value={formatBytes(diskUsed)}
        sub={`of ${formatBytes(diskTotal)}`}
      >
        <Box
          sx={{
            height: 4,
            background: designTokens.surfaceMuted,
            borderRadius: '2px',
            mb: 0.75,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${diskPct * 100}%`,
              height: '100%',
              background: designTokens.accent,
              borderRadius: '2px',
            }}
          />
        </Box>
      </StatCard>
    </Box>
  );
}

function Legend({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
        }}
      />
      <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
        {children}
      </Typography>
    </Stack>
  );
}
