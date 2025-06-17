// https://codesandbox.io/embed/rjdspd?module=/Dashboard.tsx&fontsize=12

import { DashboardRounded, MenuRounded } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Toolbar as MuiToolbar,
  Stack,
  styled,
  tabsClasses,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ColorModeIconDropdown } from './ColorModeIconDropdown';
import { MenuButton } from './MenuButton';
import SideMenuMobile from './SideMenuMobile';

const Toolbar = styled(MuiToolbar)({
  width: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'center',
  gap: '12px',
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: '8px',
    p: '8px',
    pb: 0,
  },
});

export function AppNavbar() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position='fixed'
      sx={{
        display: { xs: 'auto', md: 'none' },
        boxShadow: 0,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        top: 'var(--template-frame-height, 0px)',
      }}
    >
      <Toolbar variant='regular'>
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            flexGrow: 1,
            width: '100%',
            gap: 1,
          }}
        >
          <Stack
            direction='row'
            spacing={1}
            sx={{ justifyContent: 'center', mr: 'auto' }}
          >
            <CustomIcon />
            <Typography
              variant='h4'
              component='h1'
              sx={{ color: 'text.primary' }}
            >
              Dashboard
            </Typography>
          </Stack>
          <ColorModeIconDropdown />
          <MenuButton aria-label='menu' onClick={toggleDrawer(true)}>
            <MenuRounded />
          </MenuButton>
          <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export function CustomIcon() {
  return (
    <Box
      sx={{
        width: '1.5rem',
        height: '1.5rem',
        bgcolor: 'black',
        borderRadius: '999px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundImage:
          'linear-gradient(135deg, hsl(210, 98%, 60%) 0%, hsl(210, 100%, 35%) 100%)',
        color: 'hsla(210, 100%, 95%, 0.9)',
        border: '1px solid',
        borderColor: 'hsl(210, 100%, 55%)',
        boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
      }}
    >
      <DashboardRounded color='inherit' sx={{ fontSize: '1rem' }} />
    </Box>
  );
}
