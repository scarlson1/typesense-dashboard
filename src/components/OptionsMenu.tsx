import { useAsyncToast } from '@/hooks';
import { LogoutRounded, MoreVertRounded } from '@mui/icons-material';
import {
  Divider,
  dividerClasses,
  listClasses,
  ListItemIcon,
  listItemIconClasses,
  ListItemText,
  Menu,
  MenuItem as MuiMenuItem,
  paperClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { MenuButton } from './MenuButton';
// import { firebaseSignOut } from '../firebase/auth';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

export default function OptionsMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useAsyncToast();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // TODO: logout without redirect is causing error
  // typesense
  const handleLogout = useCallback(async () => {
    navigate({
      to: '/logout',
      search: {
        redirect: location.href,
      },
    });
  }, [location, navigate]);

  const handleToast = useCallback(
    (id: string) => {
      toast.info(`TODO: implement ${id}`, { id });
      handleClose();
    },
    [toast, handleClose]
  );

  return (
    <>
      <MenuButton
        aria-label='Open menu'
        onClick={handleClick}
        sx={{ borderColor: 'transparent' }}
      >
        <MoreVertRounded />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        id='menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: '4px',
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
          },
          [`& .${dividerClasses.root}`]: {
            margin: '4px -4px',
          },
        }}
      >
        <MenuItem onClick={() => handleToast('profile')}>Profile</MenuItem>
        <MenuItem onClick={() => handleToast('account')}>My account</MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            navigate({ to: '/auth' });
          }}
        >
          Add another account
        </MenuItem>
        <MenuItem onClick={() => handleToast('settings')}>Settings</MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: 'auto',
              minWidth: 0,
            },
          }}
        >
          <ListItemText>Logout</ListItemText>
          <ListItemIcon>
            <LogoutRounded fontSize='small' />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
}
