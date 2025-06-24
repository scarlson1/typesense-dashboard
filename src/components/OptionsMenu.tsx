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
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useStore } from 'zustand';
import { queryClient, typesenseStore } from '../utils';
import { MenuButton } from './MenuButton';
// import { firebaseSignOut } from '../firebase/auth';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

export default function OptionsMenu() {
  const navigate = useNavigate();
  const logout = useStore(typesenseStore, (state) => state.logout);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // TODO: add loading state and show loading indicator in list item
      // await firebaseSignOut();
      // handleClose();
      logout();
      queryClient.clear();
      navigate({ to: '/auth' });

      alert('TODO: signout');
    } catch (err) {
      console.log('LOGOUT ERROR: ', err);
    }
  };

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
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            navigate({ to: '/auth' });
          }}
        >
          Add another account
        </MenuItem>
        <MenuItem onClick={handleClose}>Settings</MenuItem>
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
