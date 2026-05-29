import { ErrorFallback } from '@/components';
import { AnalyticsRulesList } from '@/components/AnalyticsRulesList';
import {
  Badge,
  PageHeader,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { analyticsQueryKeys } from '@/constants';
import { useTypesenseClient } from '@/hooks';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useTypesenseVersion } from '@/hooks/useTypesenseVersion';
import { designTokens } from '@/theme/themePrimitives';
import {
  CheckRounded,
  ContentCopyRounded,
  DownloadRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
import { captureException } from '@sentry/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useCallback, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { AnalyticsRuleSchema } from 'typesense/lib/Typesense/AnalyticsRule';
import type { AnalyticsRuleSchemaV1 } from 'typesense/lib/Typesense/AnalyticsRuleV1';
import type {
  DocumentSchema,
  SearchResponse,
} from 'typesense/lib/Typesense/Documents';

export const Route = createFileRoute('/_dashboard/analytics')({
  component: RouteComponent,
  staticData: { crumb: 'Analytics' },
});

// TODO: move enable analytics and analytics to Analytics Rules List layout (or refactor to move layout to this file)

function RouteComponent() {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Analytics rules'
        badges={<Badge tone='neutral'>capture searches</Badge>}
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/analytics-query-suggestions.html'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            Analytics guide
          </Button>
        }
      />
      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        <Stack spacing={2}>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: unknown) => captureException(err)}
          >
            <Suspense>
              <AnalyticsRulesList />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(err: unknown) => captureException(err)}
          >
            <Suspense fallback={<EnableAnalyticsCard />}>
              <AnalyticsInsight />
            </Suspense>
          </ErrorBoundary>
        </Stack>
      </Box>
    </Stack>
  );
}

function AnalyticsInsight() {
  const [client, clusterId] = useTypesenseClient();
  const { is30Plus } = useTypesenseVersion();

  const { data: rules } = useSuspenseQuery({
    queryKey: analyticsQueryKeys.rules(clusterId),
    queryFn: async () => {
      if (!is30Plus) {
        const res = await client.analyticsV1.rules().retrieve();

        return res.rules as AnalyticsRuleSchemaV1[];
      } else {
        return await client.analytics.rules().retrieve();
      }
    },
  });

  if (rules.length === 0) return <EnableAnalyticsCard />;

  const popularRule = rules.find((r) => {
    if (!is30Plus)
      return (
        r.type === 'popular_queries' &&
        Boolean((r as AnalyticsRuleSchemaV1).params.destination?.collection)
      );

    return (
      r.type === 'popular_queries' &&
      Boolean((r as AnalyticsRuleSchema).params?.destination_collection)
    );
  });

  if (!popularRule) return <EnableAnalyticsCard />;

  const destination = is30Plus
    ? (popularRule as AnalyticsRuleSchema).params?.destination_collection
    : (popularRule as AnalyticsRuleSchemaV1).params.destination?.collection;

  return (
    <PopularQueriesCard
      // rule={popularRule}
      name={popularRule.name}
      destination={destination || ''}
    />
  );
}

interface PopularQueryHit {
  q: string;
  count: number;
}

function PopularQueriesCard({
  // rule,
  name,
  destination,
}: {
  // rule: AnalyticsRuleSchema;
  name: string;
  destination: string;
}) {
  const [client] = useTypesenseClient();

  const { data: hits, isLoading } = useQuery({
    queryKey: ['analytics', 'popular-queries', destination],
    queryFn: async () => {
      const res = (await client.collections(destination).documents().search({
        q: '*',
        query_by: 'q',
        sort_by: 'count:desc',
        per_page: 5,
      })) as SearchResponse<DocumentSchema>;
      return (
        res.hits
          ?.map((h) => h.document as PopularQueryHit)
          .filter((d) => d.q) ?? []
      );
    },
    enabled: Boolean(destination),
    retry: false,
  });

  const max = useMemo(
    () => Math.max(1, ...(hits?.map((h) => h.count) ?? [0])),
    [hits],
  );

  const handleDownloadCsv = useCallback(() => {
    if (!hits?.length) return;
    const csv = [
      'query,count',
      ...hits.map((h) => `${escapeCsv(h.q)},${h.count}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popular-queries-${destination}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [hits, destination]);

  return (
    <SectionCard
      title={
        <Stack
          direction='row'
          sx={{ alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}
        >
          <Typography
            component='span'
            sx={{ fontSize: 14, fontWeight: 600, color: designTokens.text }}
          >
            Popular queries
          </Typography>
          <Typography
            component='span'
            sx={{
              fontSize: 12,
              color: designTokens.textFaint,
              fontFamily: designTokens.fontMono,
            }}
          >
            · top {hits?.length ?? 5}
          </Typography>
        </Stack>
      }
      description={
        <>
          collected via{' '}
          <Box component='code' sx={inlineCodeSx}>
            {name}
          </Box>
        </>
      }
      actions={
        <Button
          variant='outlined'
          size='small'
          startIcon={<DownloadRounded sx={{ fontSize: 13 }} />}
          sx={smallButtonSx}
          onClick={handleDownloadCsv}
          disabled={!hits?.length}
        >
          CSV
        </Button>
      }
    >
      {isLoading ? (
        <Stack spacing={1.25}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant='rectangular' height={14} />
          ))}
        </Stack>
      ) : !hits?.length ? (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 13, color: designTokens.textMuted }}>
            No queries captured yet.
          </Typography>
          <Typography
            sx={{ fontSize: 12, color: designTokens.textFaint, mt: 0.5 }}
          >
            Once your application sends search traffic, the most popular queries
            will appear here.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {hits.map((h) => (
            <Stack
              key={h.q}
              direction='row'
              sx={{ alignItems: 'center', gap: 1.5 }}
            >
              <Typography
                sx={{
                  flex: '0 0 28%',
                  fontFamily: designTokens.fontMono,
                  fontSize: 12.5,
                  color: designTokens.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {h.q}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: 10,
                  background: designTokens.surfaceMuted,
                  borderRadius: '5px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    width: `${(h.count / max) * 100}%`,
                    height: '100%',
                    background: designTokens.accent,
                    borderRadius: '5px',
                    transition: 'width 200ms ease',
                  }}
                />
              </Box>
              <Typography
                sx={{
                  flex: '0 0 64px',
                  textAlign: 'right',
                  fontFamily: designTokens.fontMono,
                  fontSize: 12.5,
                  color: designTokens.textMuted,
                }}
              >
                {h.count.toLocaleString()}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const ENABLE_COMMAND = `./typesense-server --data-dir=/path/to/data --api-key=abcd \\
  --enable-search-analytics=true \\
  --analytics-dir=/path/to/analytics-data \\
  --analytics-flush-interval=60`;

function EnableAnalyticsCard() {
  const [, copy, copied] = useCopyToClipboard(2000);

  const handleCopy = useCallback(async () => {
    await copy(ENABLE_COMMAND);
  }, [copy]);

  return (
    <SectionCard
      title='Enable when self-hosting'
      description={
        <>
          Analytics must be explicitly enabled with the{' '}
          <Box component='code' sx={inlineCodeSx}>
            --enable-search-analytics
          </Box>{' '}
          and{' '}
          <Box component='code' sx={inlineCodeSx}>
            --analytics-dir
          </Box>{' '}
          flags on the Typesense server. The{' '}
          <Box component='code' sx={inlineCodeSx}>
            --analytics-flush-interval
          </Box>{' '}
          flag (minimum 60 seconds, default 3600) controls how often events are
          aggregated and persisted.
        </>
      }
      actions={
        <Button
          component='a'
          href='https://typesense.org/docs/29.0/api/analytics-query-suggestions.html#enabling-the-feature'
          target='_blank'
          rel='noopener noreferrer'
          variant='outlined'
          size='small'
          startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
          sx={smallButtonSx}
        >
          Docs
        </Button>
      }
    >
      <Box
        sx={{
          background: designTokens.codeSurface,
          borderRadius: 1,
          p: 1.75,
          color: designTokens.codeText,
          position: 'relative',
          border: (t) => `1px solid ${t.vars.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 11.5,
              fontWeight: 600,
              color: designTokens.textFaint,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            sh
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton
              size='small'
              onClick={handleCopy}
              sx={{
                color: copied ? designTokens.success : designTokens.textFaint,
                p: 0.5,
                position: 'relative',
                width: 26,
                height: 26,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: copied ? designTokens.success : designTokens.codeText,
                },
              }}
            >
              <Zoom in={!copied} timeout={180} unmountOnExit>
                <ContentCopyRounded
                  sx={{ fontSize: 14, position: 'absolute' }}
                />
              </Zoom>
              <Zoom in={copied} timeout={180} unmountOnExit>
                <CheckRounded sx={{ fontSize: 16, position: 'absolute' }} />
              </Zoom>
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          component='pre'
          sx={{
            m: 0,
            fontFamily: designTokens.fontMono,
            fontSize: 11.5,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {`./typesense-server --data-dir=`}
          <Box component='span' sx={argValueSx}>
            /path/to/data
          </Box>
          {` --api-key=`}
          <Box component='span' sx={argValueSx}>
            abcd
          </Box>
          {` \\
  --enable-search-analytics=`}
          <Box component='span' sx={argValueSx}>
            true
          </Box>
          {` \\
  --analytics-dir=`}
          <Box component='span' sx={argValueSx}>
            /path/to/analytics-data
          </Box>
          {` \\
  --analytics-flush-interval=`}
          <Box component='span' sx={argValueSx}>
            60
          </Box>
        </Box>
      </Box>
    </SectionCard>
  );
}

const inlineCodeSx = {
  fontFamily: designTokens.fontMono,
  fontSize: 11.5,
  px: 0.5,
  py: 0.1,
  borderRadius: 0.5,
  background: designTokens.codeSurface,
  color: designTokens.codeText,
};

const argValueSx = { color: '#9bc5ff' };
