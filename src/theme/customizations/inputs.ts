import type { Components, Theme } from '@mui/material/styles';

export const inputCustomizations: Components<Theme> = {
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 'inherit',
      },
    },
  },
};
