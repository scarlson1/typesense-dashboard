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
        // fontSize: '16px', // set base to prevent auto iOS zoom
        // transform: 'scale(0.875)', // adjust appearance
        // transformOrigin: 'left center', // adjust layout so position stays correct
        // '& .MuiInputBase-input': {
        //   padding: 0, // drop the 4/5 asymmetric padding
        //   height: '1.4375em',
        //   lineHeight: '1.4375em', // single-line text centers within its own line box
        // },
        // 14px visual everywhere. No transform, so inputs keep their full
        // layout width (scale() painted them 12.5% narrow).
        fontSize: '0.875rem',
        // Touch devices (iOS Safari) auto-zoom on focus when an editable
        // field is < 16px, so bump to 16px there. Desktop has no such
        // behavior and stays at 14px.
        '@media (pointer: coarse)': {
          fontSize: '16px',
        },
        WebkitFontSmoothing: 'antialiased',
        // WillChange: 'transform',
      },
    },
  },
};
