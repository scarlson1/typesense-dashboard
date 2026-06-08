import { designTokens } from '@/theme/themePrimitives';
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
        fontFamily: designTokens.fontMono,
        // WillChange: 'transform',
        // '& .MuiInputBase-root': {
        //   fontFamily: '"YourCustomFont", sans-serif',
        //   fontSize: '16px',
        //   fontWeight: 500,
        // },
        // '& .MuiInputLabel-root': {
        //   fontFamily: '"YourCustomFont", sans-serif',
        //   fontSize: '14px',
        // },
        // '& .MuiFormHelperText-root': {
        //   fontFamily: '"YourCustomFont", sans-serif',
        //   fontSize: '12px',
        // }
      },
      input: ({ theme }) => ({
        '&::placeholder': {
          color: theme.vars.palette.text.faint,
        },
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        // ({ theme }) => ({
        // minHeight: 28,
        // padding: '0 8px',
        // borderRadius: theme.shape.borderRadius,
        fontFamily: designTokens.fontMono,
        '& fieldset': {
          borderColor: 'var(--ts-borderStrong)', // theme.vars.palette. // designTokens.borderStrong
          transition: 'border-color 120ms ease',
        },
        '&:hover fieldset': {
          borderColor: designTokens.accent,
          borderWidth: '1px',
        },
        '& .MuiAutocomplete-endAdornment': {
          right: 4,
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--ts-borderStrong)',
          transition: 'border-color 120ms ease',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--ts-accent)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--ts-accent)',
          borderWidth: '1px', // MUI defaults to 2px on focus
        },
      }, // ),
      input: {
        // padding: '0 4px !important',
        fontFamily: designTokens.fontMono,
        '&::placeholder': {
          color: designTokens.textFaint,
          opacity: 1,
        },
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      root: {
        // ({ theme }) => ({
        // Targets the options list

        '& .MuiOutlinedInput-root': {
          // borderRadius: theme.shape.borderRadius,
          fontFamily: designTokens.fontMono,
          // padding: '0 8px',
          // minHeight: 28,
          fontSize: '0.875rem',
          '@media (pointer: coarse)': {
            fontSize: '16px',
          },
          WebkitFontSmoothing: 'antialiased',
          // '& .MuiAutocomplete-input': { padding: '0 4px' },
          '& fieldset': {
            borderColor: 'var(--ts-borderStrong)',
            transition: 'border-color 120ms ease',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--ts-borderStrong)',
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--ts-accent)',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
            {
              borderColor: 'var(--ts-accent)',
            },
          '& .MuiAutocomplete-endAdornment': { right: 4 },
        },
      }, // ),
      listbox: {
        fontFamily: designTokens.fontMono,
      },
      // Targets the input text
      input: {
        fontFamily: designTokens.fontMono,
      },
    },
  },
  // MuiInputLabel: {
  //   styleOverrides: {
  //     root: {
  //       color: 'var(--palette-text-faint)',
  //       '&.Mui-focused': {
  //         color: 'var(--mui-palette-primary-main)',
  //       },
  //     },
  //   },
  // },
};
