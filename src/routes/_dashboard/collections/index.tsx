import { ErrorFallback } from '@/components';
import { CollectionsTable } from '@/components/CollectionsTable';
import {
  Badge,
  PageHeader,
  primaryButtonSx,
  smallButtonSx,
  StatCard,
} from '@/components/redesign';
import { collectionQueryKeys } from '@/constants';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { formatBytes } from '@/utils';
import {
  AddRounded,
  DownloadRounded,
  FiberManualRecordRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
  type Theme,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate,
} from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/_dashboard/collections/')({
  component: CollectionsComponent,
  staticData: { crumb: 'Collections' },
});

function CollectionsComponent() {
  const mobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

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
          px: { xs: 2, md: 4 },
          py: 2.5,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        {mobile ? (
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: unknown) => captureException(err)}
          >
            <Suspense fallback={null}>
              <MobileCollectionList />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <>
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
                backgroundColor: 'background.paper',
                border: `1px solid ${designTokens.border}`,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onError={(err: unknown) => captureException(err)}
              >
                <Suspense fallback={<CollectionsTableFallback />}>
                  <CollectionsTable />
                </Suspense>
              </ErrorBoundary>
            </Box>
          </>
        )}
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
            backgroundColor: 'background.paper',
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1,
            height: 92,
          }}
        />
      ))}
    </Box>
  );
}

function CollectionsTableFallback() {
  return (
    <Box sx={{ p: 1.75 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          sx={{
            height: 24,
            my: 1.5,
            borderRadius: 0.5,
            background: designTokens.surfaceMuted,
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
  const totalDocs = collections?.reduce(
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
      <StatCard label='Search QPS' value={qps.toFixed(1)} sub='requests/sec' />
    </Box>
  );
}

function MobileCollectionList() {
  const [client, clusterId] = useTypesenseClient();
  const navigate = useNavigate();
  const { data: collections } = useQuery({
    queryKey: collectionQueryKeys.list(clusterId, {}),
    queryFn: () => client.collections().retrieve(),
  });

  if (!collections?.length) return null;

  return (
    <Stack sx={{ gap: 1.25 }}>
      {collections?.map((c) => {
        const docs = c.num_documents ?? 0;
        const created = (c as { created_at?: number }).created_at;
        const updatedLabel = created
          ? `updated ${formatDistanceToNow(new Date(created * 1000), { addSuffix: true })}`
          : '';
        return (
          <Box
            key={c.name}
            onClick={() =>
              navigate({
                to: '/collections/$collectionId/documents/search',
                params: { collectionId: c.name },
              })
            }
            sx={{
              backgroundColor: 'background.paper',
              border: `1px solid ${designTokens.border}`,
              borderRadius: 1.5,
              px: 2,
              py: 1.75,
              cursor: 'pointer',
              '&:hover': { borderColor: designTokens.borderStrong },
            }}
          >
            <Stack
              direction='row'
              sx={{
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75 }}>
                  <FiberManualRecordRounded
                    sx={{
                      fontSize: 8,
                      color: designTokens.success,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: designTokens.text,
                    }}
                  >
                    {c.name.replace(/_/g, ' ')}
                  </Typography>
                </Stack>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 12,
                    color: designTokens.textFaint,
                    fontFamily: designTokens.fontMono,
                    mt: 0.25,
                    pl: 1.75,
                  }}
                >
                  {c.name}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: designTokens.textMuted,
                  fontFamily: designTokens.fontMono,
                  flexShrink: 0,
                  pt: 0.25,
                }}
              >
                {docs.toLocaleString()}
              </Typography>
            </Stack>
            {updatedLabel && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: designTokens.textFaint,
                  fontFamily: designTokens.fontMono,
                  mt: 0.75,
                  pl: 1.75,
                }}
              >
                {updatedLabel}
              </Typography>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
