import type { Components, Theme } from '@mui/material/styles';

export const dataDisplayCustomizations: Components<Theme> = {
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
      },
    },
  },
};
