import { AnalyticsRulesList } from '@/components/AnalyticsRulesList';
import {
  Badge,
  PageHeader,
  smallButtonSx,
} from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
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
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => captureException(err)}
        >
          <Suspense>
            <AnalyticsRulesList />
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Stack>
  );
}
