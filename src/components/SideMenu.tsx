import {
  Avatar,
  Box,
  Divider,
  drawerClasses,
  Drawer as MuiDrawer,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { MenuContent } from './MenuContent';
import OptionsMenu from './OptionsMenu';
import { SelectContent } from './SelectContent';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export function SideMenu() {
  // const user = useUser();
  // TODO: get user/server info from context
  const user = {
    displayName: 'John Doe',
    email: 'dev@typesense.com',
  };

  return (
    <Drawer
      variant='permanent'
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        <SelectContent />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
        {/* <CardAlert /> */}
      </Box>
      <Stack
        direction='row'
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes='small'
          // alt={user?.displayName || ''}
          // src={user?.photoURL || ''}
          sx={{ width: 36, height: 36 }}
        />
        <Box
          sx={{
            mr: 'auto',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Typography
            variant='body2'
            sx={{ fontWeight: 500, lineHeight: '16px' }}
          >
            {user?.displayName || 'John Doe'}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {user?.email || ''}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
