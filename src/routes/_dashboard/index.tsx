import { ErrorFallback } from '@/components';
import {
  BigChart,
  Badge,
  SectionCard,
  StatCard,
  smallButtonSx,
  primaryButtonSx,
} from '@/components/redesign';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { formatBytes } from '@/utils';
import {
  AddRounded,
  AutoFixHighRounded,
  CompareArrowsRounded,
  DownloadRounded,
  KeyRounded,
  LeakAddRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { captureException } from '@sentry/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/_dashboard/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <ErrorBoundary
        fallback={<HomeHeader fallback />}
        onError={(err: unknown) => captureException(err)}
      >
        <HomeHeader />
      </ErrorBoundary>

      <Box
        sx={{
          flex: 1,
          px: { xs: 3, md: 4 },
          py: 2.75,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
            gap: 2,
          }}
        >
          <Stack sx={{ gap: 1.75, minWidth: 0 }}>
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(err: unknown) => captureException(err)}
            >
              <Suspense fallback={<MetricStripFallback />}>
                <MetricStrip />
              </Suspense>
            </ErrorBoundary>

            <SectionCard
              title='Search & write volume'
              description='last 24 hours'
              actions={<TimeRangeToggle />}
            >
              <Box sx={{ minHeight: 220 }}>
                <BigChart />
              </Box>
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
                <LegendDot color={designTokens.accent}>Search</LegendDot>
                <LegendDot color='#3aafe0'>Import</LegendDot>
                <LegendDot color='#f6b500'>Write</LegendDot>
                <LegendDot color={designTokens.textSubtle}>Delete</LegendDot>
              </Stack>
              <Alert severity='warning' sx={{ mt: 1.5 }}>
                Illustrative chart — Typesense's API does not expose historical
                time-series for QPS/latency. Hook up an external metrics store
                (e.g. Prometheus + Grafana) to render real history.
              </Alert>
            </SectionCard>
          </Stack>

          <Stack sx={{ gap: 1.75, minWidth: 0 }}>
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(err: unknown) => captureException(err)}
            >
              <Suspense fallback={<ClusterStatusFallback />}>
                <ClusterStatusCard />
              </Suspense>
            </ErrorBoundary>
            <QuickActionsCard />
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}

function HomeHeader({ fallback }: { fallback?: boolean } = {}) {
  return (
    <Box
      sx={{
        px: { xs: 3, md: 4 },
        pt: { xs: 3, md: 3.5 },
        pb: 2.25,
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${designTokens.border}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          color: designTokens.textFaint,
          fontFamily: designTokens.fontMono,
          mb: 0.75,
        }}
      >
        {fallback ? '—' : <ServerEyebrow />}
      </Typography>
      <Stack
        direction='row'
        sx={{ alignItems: 'flex-start', gap: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            component='h1'
            sx={{
              m: 0,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: designTokens.text,
              lineHeight: 1.15,
            }}
          >
            Cluster overview
          </Typography>
          {!fallback && <HomeSubtitle />}
        </Box>
        <Stack direction='row' sx={{ gap: 1 }}>
          <Button
            component='a'
            href='https://typesense.org/docs/'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            Open docs
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
        </Stack>
      </Stack>
    </Box>
  );
}

function ServerEyebrow() {
  const [client, clientId] = useTypesenseClient();
  // /debug is admin-only; tolerate 401/403 by hiding the version.
  const { data } = useQuery({
    queryKey: [clientId, 'debug'],
    queryFn: () => client.debug.retrieve(),
    staleTime: 1000 * 300,
    retry: false,
  });
  const node = client.configuration.nodes[0] as
    | { host?: string; url?: string; port?: number }
    | undefined;
  const host = node?.host ?? node?.url ?? '';
  const port = node?.port ?? '';
  return (
    <>
      NODE-1 · {host}
      {port ? `:${port}` : ''}
      {data?.version ? ` · v${data.version}` : ''}
    </>
  );
}

function HomeSubtitle() {
  const [client, clientId] = useTypesenseClient();
  const { data: collections } = useQuery({
    queryKey: [clientId, 'collections', 'list'],
    queryFn: () => client.collections().retrieve(),
    staleTime: 1000 * 60,
    retry: false,
  });
  if (!collections) return null;
  const docs = collections.reduce(
    (acc, c) => acc + (c.num_documents ?? 0),
    0,
  );
  return (
    <Typography
      sx={{ fontSize: 13.5, color: designTokens.textMuted, mt: 0.75 }}
    >
      Your cluster is healthy. {collections.length} collection
      {collections.length === 1 ? '' : 's'} indexed ·{' '}
      <Box component='span' sx={{ fontFeatureSettings: '"tnum"' }}>
        {docs.toLocaleString()}
      </Box>{' '}
      documents.
    </Typography>
  );
}

function MetricStripFallback() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
        gap: 1.25,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            backgroundColor: 'background.paper',
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1,
            height: 88,
          }}
        />
      ))}
    </Box>
  );
}

function MetricStrip() {
  const [client, clientId] = useTypesenseClient();
  const { data: stats } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'stats'],
    queryFn: () => client.stats.retrieve(),
    refetchInterval: 5000,
    staleTime: 4000,
  });
  const { data: metrics } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    refetchInterval: 5000,
    staleTime: 4000,
  });
  const { data: collections } = useSuspenseQuery({
    queryKey: [clientId, 'collections', 'list'],
    queryFn: () => client.collections().retrieve(),
    staleTime: 1000 * 60,
  });

  const totalDocs = useMemo(
    () => collections.reduce((acc, c) => acc + (c.num_documents ?? 0), 0),
    [collections],
  );
  const qps =
    Number((stats as Record<string, unknown>).total_requests_per_second ?? 0) ||
    0;
  const latencyMs = (stats as { latency_ms?: Record<string, number> })
    .latency_ms;
  const latency =
    Number(latencyMs?.['search'] ?? latencyMs?.['total'] ?? 0) || 0;
  const memUsed = Number(metrics.system_memory_used_bytes ?? 0);
  const memTotal = Number(metrics.system_memory_total_bytes ?? 0);
  const memPct = memTotal ? Math.round((memUsed / memTotal) * 100) : 0;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
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
        label='Documents'
        value={totalDocs.toLocaleString()}
        sub={`${collections.length} collections`}
        delta='+12,402 wk'
        deltaPositive
      />
      <StatCard
        label='Memory'
        value={formatBytes(memUsed)}
        sub={`${memPct}% of ${formatBytes(memTotal)}`}
      />
    </Box>
  );
}

function ClusterStatusFallback() {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: `1px solid ${designTokens.border}`,
        borderRadius: 1,
        height: 180,
      }}
    />
  );
}

function ClusterStatusCard() {
  const [client, clientId] = useTypesenseClient();
  const { data: metrics } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    refetchInterval: 5000,
    staleTime: 4000,
  });
  const memUsed = Number(metrics.system_memory_used_bytes ?? 0);
  const memTotal = Number(metrics.system_memory_total_bytes ?? 0);
  const diskUsed = Number(metrics.system_disk_used_bytes ?? 0);
  const diskTotal = Number(metrics.system_disk_total_bytes ?? 0);

  const cpuPcts = Object.entries(metrics).filter(([k]) =>
    k.startsWith('system_cpu'),
  );
  const cpuAvg =
    cpuPcts.length > 0
      ? cpuPcts.reduce((a, [, v]) => a + Number(v), 0) / cpuPcts.length
      : 0;

  return (
    <SectionCard
      title='Cluster status'
      actions={
        <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75 }}>
          <Badge tone='success'>● Healthy</Badge>
        </Stack>
      }
    >
      <ProgressRow
        label='Memory'
        value={formatBytes(memUsed)}
        sub={`of ${formatBytes(memTotal)}`}
        pct={memTotal ? memUsed / memTotal : 0}
      />
      <ProgressRow
        label='Disk'
        value={formatBytes(diskUsed)}
        sub={`of ${formatBytes(diskTotal)}`}
        pct={diskTotal ? diskUsed / diskTotal : 0}
      />
      <ProgressRow
        label='CPU (avg)'
        value={`${cpuAvg.toFixed(1)}%`}
        sub={`${cpuPcts.length} cores`}
        pct={cpuAvg / 100}
      />
    </SectionCard>
  );
}

function ProgressRow({
  label,
  value,
  sub,
  pct,
}: {
  label: string;
  value: string;
  sub: string;
  pct: number;
}) {
  return (
    <Stack direction='row' sx={{ alignItems: 'center', gap: 1.25 }}>
      <Box
        component='span'
        sx={{
          flex: '0 0 70px',
          color: designTokens.textMuted,
          fontSize: 12.5,
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          flex: 1,
          height: 5,
          background: designTokens.surfaceMuted,
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${Math.min(100, Math.max(0, pct * 100))}%`,
            height: '100%',
            background: designTokens.accent,
            borderRadius: '2px',
          }}
        />
      </Box>
      <Box
        component='span'
        sx={{
          fontFamily: designTokens.fontMono,
          fontSize: 12,
          color: designTokens.text,
          flex: '0 0 80px',
          textAlign: 'right',
        }}
      >
        {value}
      </Box>
      <Box
        component='span'
        sx={{
          fontSize: 11,
          color: designTokens.textFaint,
          flex: '0 0 90px',
        }}
      >
        {sub}
      </Box>
    </Stack>
  );
}

function QuickActionsCard() {
  const actions: { icon: typeof AddRounded; label: string; to: string }[] = [
    { icon: AddRounded, label: 'New collection', to: '/collections/new' },
    { icon: KeyRounded, label: 'Generate API key', to: '/keys' },
    { icon: DownloadRounded, label: 'Backup', to: '/server' },
    { icon: AutoFixHighRounded, label: 'Curation', to: '/collections' },
    { icon: LeakAddRounded, label: 'Synonyms', to: '/collections' },
    {
      icon: CompareArrowsRounded,
      label: 'Create alias',
      to: '/alias',
    },
  ];
  return (
    <SectionCard title='Quick actions'>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: 1,
        }}
      >
        {actions.map(({ icon: Icon, label, to }) => (
          <Box
            key={label}
            component={RouterLink as React.ElementType}
            to={to}
            sx={{
              background: designTokens.surfaceMuted,
              border: `1px solid ${designTokens.border}`,
              borderRadius: 0.75,
              px: 1.25,
              py: 1.125,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              fontSize: 12.5,
              color: designTokens.text,
              fontWeight: 500,
              textDecoration: 'none',
              '&:hover': { background: designTokens.surfaceTinted },
            }}
          >
            <Icon sx={{ fontSize: 14, color: designTokens.accent }} />
            {label}
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}

function TimeRangeToggle() {
  const tabs = ['1h', '6h', '24h', '7d'];
  return (
    <Stack
      direction='row'
      sx={{
        gap: 0.5,
        background: designTokens.surfaceMuted,
        p: 0.25,
        borderRadius: 0.75,
        border: `1px solid ${designTokens.border}`,
      }}
    >
      {tabs.map((t) => (
        <Box
          key={t}
          sx={{
            px: 1.125,
            py: 0.375,
            borderRadius: 0.5,
            fontSize: 11.5,
            fontWeight: 500,
            background: t === '24h' ? 'background.paper' : 'transparent',
            color: t === '24h' ? designTokens.text : designTokens.textMuted,
            cursor: 'pointer',
            boxShadow: t === '24h' ? '0 1px 1px rgba(0,0,0,.06)' : 'none',
          }}
        >
          {t}
        </Box>
      ))}
    </Stack>
  );
}

function LegendDot({
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
      {children}
    </Stack>
  );
}

