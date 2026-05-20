import { ErrorFallback } from '@/components';
import { AppNavbar } from '@/components/AppNavbar';
import { SidebarBoundary, TopBar } from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import { typesenseStore } from '@/utils';
import { Box } from '@mui/material';
import { captureException } from '@sentry/react';
import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
} from '@tanstack/react-router';
import { ErrorBoundary } from 'react-error-boundary';

function isAuthenticated() {
  const creds = typesenseStore.getState().credentials;
  const credsKey = typesenseStore.getState().currentCredsKey;

  return Boolean(credsKey && creds[credsKey]);
}

export const Route = createFileRoute('/_dashboard')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/auth',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function RouteComponent() {
  const matches = useMatches();
  const crumbs = matches
    .filter((m) => m.staticData.crumb)
    .map((m) => ({ label: m.staticData.crumb as string }));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default' }}>
      <SidebarBoundary />
      <AppNavbar />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: designTokens.surfaceTinted,
        }}
      >
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <TopBar crumbs={crumbs} />
        </Box>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(err: unknown) => {
            captureException(err);
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </Box>
        </ErrorBoundary>
      </Box>
    </Box>
  );
}
