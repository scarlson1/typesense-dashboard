import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsRulesList } from '../../components';

export const Route = createFileRoute('/_dashboard/analytics')({
  component: RouteComponent,
  staticData: {
    crumb: 'Analytics',
  },
});

function RouteComponent() {
  return (
    <>
      <Typography variant='h3' gutterBottom>
        Analytics Rules
      </Typography>
      <Typography sx={{ pb: 2 }}>
        This section allows you to configure rules to capture search analytics.{' '}
        <Link
          href='https://typesense.org/docs/28.0/api/analytics-query-suggestions.html'
          target='_blank'
          rel='noopener noreferrer'
        >
          Docs <OpenInNewRounded fontSize='inherit' sx={{ ml: 0.25 }} />
        </Link>
      </Typography>
      <Box sx={{ maxWidth: 800 }}>
        <AnalyticsRulesList />
      </Box>
    </>
  );
}
