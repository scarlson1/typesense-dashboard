import { ErrorFallback } from '@/components';
import { AppNavbar } from '@/components/AppNavbar';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { typesenseStore } from '@/utils';
import { alpha, Box, Stack } from '@mui/material';
import { captureException } from '@sentry/react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
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
  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <AppNavbar />
      <Box
        component='main'
        sx={(theme) => ({
          // TODO: use css var for AppNavbar height
          // height: { xs: 'calc(100vh - 60px)', md: '100vh' },
          flexGrow: 1,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflow: 'auto',
        })}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
          }}
        >
          <Header />
          <Box
            sx={{
              width: '100%',
              maxWidth: { sm: '100%', md: '1600px' },
              pb: 5,
            }}
          >
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(err: Error) => {
                captureException(err);
              }}
            >
              <Outlet />
            </ErrorBoundary>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
