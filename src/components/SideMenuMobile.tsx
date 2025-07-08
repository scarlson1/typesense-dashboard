import { LogoutRounded, NotificationsRounded } from '@mui/icons-material';
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  drawerClasses,
  Stack,
  Typography,
} from '@mui/material';
import { MenuButton } from './MenuButton';
import { MenuContent } from './MenuContent';
// import { useNavigate } from '@tanstack/react-router';
// import { firebaseSignOut } from '../firebase/auth';
// import { useAsyncToast, useUser } from '@/hooks';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({
  open,
  toggleDrawer,
}: SideMenuMobileProps) {
  // const navigate = useNavigate({ from: '/' });
  // const { data: user } = useUser();
  // const user = useUser();
  // const toast = useAsyncToast();
  const user = {
    displayName: 'John Doe',
    photoURL: '',
  };

  const handleLogout = async () => {
    try {
      // TODO: add loading state and show loading indicator in list item
      // await firebaseSignOut();
      // toggleDrawer(false);
      // navigate({ to: '/auth/signin' });
      alert('TODO: signout');
    } catch (err: any) {
      console.log('LOGOUT ERROR: ', err);
      // toast.error(err?.message || 'error logging out');
    }
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction='row' sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction='row'
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes='small'
              alt={user?.displayName || ''}
              // src='/static/images/avatar/7.jpg'
              src={user?.photoURL || ''}
              sx={{ width: 24, height: 24 }}
            />
            <Typography component='p' variant='h6'>
              {user?.displayName || 'John Doe'}
            </Typography>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRounded />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        {/* <CardAlert /> */}
        <Stack sx={{ p: 2 }}>
          <Button
            variant='outlined'
            fullWidth
            startIcon={<LogoutRounded />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
