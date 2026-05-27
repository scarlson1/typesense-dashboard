import { AnalyticsRulesList } from '@/components/AnalyticsRulesList';
import {
  Badge,
  PageHeader,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { designTokens } from '@/theme/themePrimitives';
import {
  CheckRounded,
  ContentCopyRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components';
import { captureException } from '@sentry/react';

export const Route = createFileRoute('/_dashboard/analytics')({
  component: RouteComponent,
  staticData: { crumb: 'Analytics' },
});

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
          <EnableAnalyticsCard />
        </Stack>
      </Box>
    </Stack>
  );
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
