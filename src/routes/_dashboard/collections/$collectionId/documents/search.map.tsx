import GeoSearch from '@/components/GeoSearch';
import {
  Box,
  Button,
  Paper,
  Skeleton,
  styled,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

// TODO:
// swipeable drawer from bottom when on mobile: https://mui.com/material-ui/react-drawer/#swipeable-edge
// perm drawer to right on > md ??

// Container - flex - take up full height
// split with fixed right side to show search & results

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/search/map'
)({
  component: RouteComponent,
  staticData: {
    crumb: 'Map',
  },
});

function RouteComponent() {
  const matches = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <Box>
      <Paper
        sx={{
          height: 800,
          my: 3,
          position: 'relative',
        }}
      >
        <GeoSearch geoFieldName='coordinates' />
      </Paper>
      {/* <Box sx={{ display: { xs: 'block', sm: 'none' } }}> */}
      {matches ? <SwipeableEdgeDrawer /> : null}
      {/* </Box> */}
    </Box>
  );
}

const drawerBleeding = 56;

const StyledBox = styled('div')(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.applyStyles('dark', {
    backgroundColor: grey[800],
  }),
}));

const Puller = styled('div')(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  ...theme.applyStyles('dark', {
    backgroundColor: grey[900],
  }),
}));

export default function SwipeableEdgeDrawer() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const iOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <>
      <Box sx={{ textAlign: 'center', pt: 1 }}>
        <Button onClick={toggleDrawer(true)}>Open</Button>
      </Box>
      <SwipeableDrawer
        // container={container}
        anchor='bottom'
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        keepMounted
        disableDiscovery={iOS}
        sx={{
          '& .MuiPaper-root': {
            height: `calc(80% - ${drawerBleeding}px)`,
            overflow: 'visible',
          },
        }}
      >
        <StyledBox
          sx={{
            position: 'absolute',
            top: -drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: 'visible',
            right: 0,
            left: 0,
          }}
        >
          <Puller />
          <Typography sx={{ p: 2, color: 'text.secondary' }}>
            51 results
          </Typography>
        </StyledBox>
        <StyledBox sx={{ px: 2, pb: 2, height: '100%', overflow: 'auto' }}>
          <Skeleton
            variant='rectangular'
            height='100%'
            sx={{ minHeight: 200 }}
          />
        </StyledBox>
      </SwipeableDrawer>
    </>
  );
}
