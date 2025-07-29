import { styled, SwipeableDrawer } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useState, type ReactNode } from 'react';

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

interface SwipeableEdgeDrawer {
  children: ReactNode;
  tabContent?: ReactNode;
}

export default function SwipeableEdgeDrawer({
  children,
  tabContent,
}: SwipeableEdgeDrawer) {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const iOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <>
      {/* <Box sx={{ textAlign: 'center', pt: 1 }}>
        <Button onClick={toggleDrawer(true)}>Open</Button>
      </Box> */}
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
        slotProps={{
          paper: {
            sx: { touchAction: 'pan-y', overflow: 'visible' },
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
          {tabContent}
        </StyledBox>
        <StyledBox
          sx={{
            px: 2,
            py: 2,
            height: '80vh',
            // height: '100%',
            overflow: 'auto',
          }}
        >
          {children}
        </StyledBox>
      </SwipeableDrawer>
    </>
  );
}
