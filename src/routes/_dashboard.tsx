import { alpha, Box, Stack } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AppNavbar, SideMenu } from '../components';
import { Header } from '../components/Header';
// import { AppNavbar, Header, SideMenu } from '../components';

// async function isAuthenticated() {
//   const auth = getAuth();
//   await auth.authStateReady();
//   // console.log('AWAITING authStateReady');
//   return Boolean(auth.currentUser);
// }

export const Route = createFileRoute('/_dashboard')({
  component: RouteComponent,
  // beforeLoad: async ({ context, location }) => {
  //   if (!context.user?.uid) {
  //     if (!(await isAuthenticated()))
  //       throw redirect({
  //         to: '/auth/signin',
  //         search: {
  //           redirect: location.href,
  //         },
  //       });
  //   }
  // },
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
