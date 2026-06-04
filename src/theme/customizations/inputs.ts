import type { Components, Theme } from '@mui/material/styles';

export const inputCustomizations: Components<Theme> = {
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 'inherit',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        fontSize: '16px', // set base to prevent auto iOS zoom
        transform: 'scale(0.875)', // adjust appearance
        transformOrigin: 'left center', // adjust layout so position stays correct
        // '& .MuiInputBase-input': {
        //   padding: 0, // drop the 4/5 asymmetric padding
        //   height: '1.4375em',
        //   lineHeight: '1.4375em', // single-line text centers within its own line box
        // },
        WebkitFontSmoothing: 'antialiased',
        // WillChange: 'transform',
      },
    },
  },
};
