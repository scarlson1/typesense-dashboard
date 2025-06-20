import { alpha, Box, Stack } from '@mui/material';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AppNavbar, Header, SideMenu } from '../components';
import { typesenseStore } from '../utils';

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
          <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
            <Outlet />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
