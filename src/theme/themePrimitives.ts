import type { PaletteMode, Shadows } from '@mui/material/styles';
import { alpha, createTheme } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation'; // added for theme.vars

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    highlighted: true;
  }
}
// declare module '@mui/material/styles/createPalette' {
declare module '@mui/material/styles' {
  interface ColorRange {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  interface PaletteColor extends ColorRange {}
  // type PaletteColor = ColorRange

  interface Palette {
    baseShadow: string;
  }
}

const defaultTheme = createTheme();

const customShadows: Shadows = [...defaultTheme.shadows];

// Stripe-leaning brand palette — accent #0570de
export const brand = {
  50: 'hsl(213, 86%, 95%)',
  100: 'hsl(213, 80%, 90%)',
  200: 'hsl(212, 78%, 78%)',
  300: 'hsl(211, 84%, 60%)',
  400: 'hsl(210, 95%, 44%)',
  500: 'hsl(212, 93%, 38%)',
  600: 'hsl(212, 90%, 33%)',
  700: 'hsl(212, 85%, 27%)',
  800: 'hsl(213, 73%, 15%)',
  900: 'hsl(213, 73%, 12%)',
};

// Hairline-border palette
export const gray = {
  50: 'hsl(210, 25%, 98%)',
  100: 'hsl(210, 27%, 97%)',
  200: 'hsl(218, 19%, 91%)',
  300: 'hsl(214, 13%, 79%)',
  400: 'hsl(212, 13%, 68%)',
  500: 'hsl(210, 16%, 60%)',
  600: 'hsl(212, 22%, 33%)',
  700: 'hsl(212, 30%, 24%)',
  800: 'hsl(213, 73%, 15%)',
  900: 'hsl(213, 73%, 8%)',
};

export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)',
};

export const orange = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 92%, 90%)',
  200: 'hsl(45, 94%, 80%)',
  300: 'hsl(45, 90%, 65%)',
  400: 'hsl(45, 90%, 40%)',
  500: 'hsl(45, 90%, 35%)',
  600: 'hsl(45, 91%, 25%)',
  700: 'hsl(45, 94%, 20%)',
  800: 'hsl(45, 95%, 16%)',
  900: 'hsl(45, 93%, 12%)',
};

export const red = {
  50: 'hsl(0, 100%, 97%)',
  100: 'hsl(0, 92%, 90%)',
  200: 'hsl(0, 94%, 80%)',
  300: 'hsl(0, 90%, 65%)',
  400: 'hsl(0, 90%, 40%)',
  500: 'hsl(0, 90%, 30%)',
  600: 'hsl(0, 91%, 25%)',
  700: 'hsl(0, 94%, 18%)',
  800: 'hsl(0, 95%, 12%)',
  900: 'hsl(0, 93%, 6%)',
};

const systemFont = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
];

export const getDesignTokens = (mode: PaletteMode) => {
  customShadows[1] =
    mode === 'dark'
      ? 'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px'
      : 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px';

  return {
    palette: {
      mode,
      primary: {
        light: brand[200],
        main: brand[400],
        dark: brand[700],
        contrastText: brand[50],
        ...(mode === 'dark' && {
          contrastText: brand[50],
          light: brand[300],
          main: brand[400],
          dark: brand[700],
        }),
      },
      secondary: {
        light: gray[200],
        main: gray[400],
        dark: gray[700],
        contrastText: gray[50],
        ...(mode === 'dark' && {
          contrastText: gray[50],
          light: gray[300],
          main: gray[400],
          dark: gray[700],
        }),
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
        ...(mode === 'dark' && {
          contrastText: brand[300],
          light: brand[500],
          main: brand[700],
          dark: brand[900],
        }),
      },
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
        ...(mode === 'dark' && {
          light: orange[400],
          main: orange[500],
          dark: orange[700],
        }),
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
        ...(mode === 'dark' && {
          light: red[400],
          main: red[500],
          dark: red[700],
        }),
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
        ...(mode === 'dark' && {
          light: green[400],
          main: green[500],
          dark: green[700],
        }),
      },
      grey: {
        ...gray,
      },
      divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
      background: {
        default: 'hsl(0, 0%, 100%)',
        paper: 'hsl(0, 0%, 100%)',
        ...(mode === 'dark' && {
          default: gray[900],
          paper: 'hsl(213, 73%, 11%)',
        }),
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        tertiary: gray[500],
        warning: orange[400],
        ...(mode === 'dark' && {
          primary: 'hsl(0, 0%, 100%)',
          secondary: gray[400],
          tertiary: gray[500],
        }),
      },
      action: {
        hover: alpha(gray[200], 0.2),
        selected: `${alpha(gray[200], 0.3)}`,
        ...(mode === 'dark' && {
          hover: alpha(gray[600], 0.2),
          selected: alpha(gray[600], 0.3),
        }),
      },
    },
    typography: {
      fontFamily: ['"Inter"', ...systemFont].join(','),
      fontFamilyCode: [
        '"JetBrains Mono"',
        '"SF Mono"',
        'Menlo',
        'Consolas',
        'Monaco',
        'monospace',
      ].join(','),
      fontFamilyTagline: ['"Inter"', ...systemFont].join(','),
      fontFamilySystem: systemFont.join(','),
      fontWeightSemiBold: 600,
      fontWeightExtraBold: 800,
      h1: {
        fontSize: defaultTheme.typography.pxToRem(48),
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: defaultTheme.typography.pxToRem(36),
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: defaultTheme.typography.pxToRem(30),
        lineHeight: 1.2,
      },
      h4: {
        fontSize: defaultTheme.typography.pxToRem(24),
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h5: {
        fontSize: defaultTheme.typography.pxToRem(20),
        fontWeight: 600,
      },
      h6: {
        fontSize: defaultTheme.typography.pxToRem(18),
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: defaultTheme.typography.pxToRem(18),
      },
      subtitle2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 500,
      },
      body1: {
        fontSize: defaultTheme.typography.pxToRem(14),
      },
      body2: {
        fontSize: defaultTheme.typography.pxToRem(13),
        fontWeight: 400,
      },
      caption: {
        fontSize: defaultTheme.typography.pxToRem(12),
        fontWeight: 400,
      },
    },
    shape: {
      borderRadius: 6,
    },
    shadows: customShadows,
  };
};

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        light: brand[200],
        main: brand[400],
        dark: brand[700],
        contrastText: brand[50],
      },
      secondary: {
        light: gray[200],
        main: gray[400],
        dark: gray[700],
        contrastText: gray[50],
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
      },
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
      },
      grey: {
        ...gray,
      },
      divider: 'var(--ts-border)',
      background: {
        default: 'var(--ts-bg)',
        paper: 'var(--ts-surface)',
      },
      text: {
        primary: 'var(--ts-text)',
        secondary: 'var(--ts-textMuted)',
        warning: orange[400],
      },
      action: {
        hover: alpha(gray[200], 0.2),
        selected: `${alpha(gray[200], 0.3)}`,
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
    },
  },
  dark: {
    palette: {
      primary: {
        contrastText: brand[50],
        light: brand[300],
        main: brand[400],
        dark: brand[700],
      },
      secondary: {
        contrastText: gray[50],
        light: gray[300],
        main: gray[400],
        dark: gray[700],
      },
      info: {
        contrastText: brand[300],
        light: brand[500],
        main: brand[700],
        dark: brand[900],
      },
      warning: {
        light: orange[400],
        main: orange[500],
        dark: orange[700],
      },
      error: {
        light: red[400],
        main: red[500],
        dark: red[700],
      },
      success: {
        light: green[400],
        main: green[500],
        dark: green[700],
      },
      grey: {
        ...gray,
      },
      divider: 'var(--ts-border)',
      background: {
        default: 'var(--ts-bg)',
        paper: 'var(--ts-surface)',
      },
      text: {
        primary: 'var(--ts-text)',
        secondary: 'var(--ts-textMuted)',
      },
      action: {
        hover: alpha(gray[600], 0.2),
        selected: alpha(gray[600], 0.3),
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
    },
  },
};

export const typography = {
  fontFamily: 'Inter, sans-serif',
  h1: {
    fontSize: defaultTheme.typography.pxToRem(48),
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(36),
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(30),
    lineHeight: 1.2,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontWeight: 600,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(18),
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 500,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(14),
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(13),
    fontWeight: 400,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontWeight: 400,
  },
};

export const shape = {
  borderRadius: 6,
};

// Stripe-leaning design tokens shared across redesign primitives.
// Mirrors `aT` in the source design files. Each color is a CSS-variable
// reference so light/dark themes flip via the `data-mui-color-scheme`
// attribute (palettes defined in src/index.css).
export const designTokens = {
  bg: 'var(--ts-bg)',
  surface: 'var(--ts-surface)',
  surfaceMuted: 'var(--ts-surfaceMuted)',
  surfaceTinted: 'var(--ts-surfaceTinted)',
  border: 'var(--ts-border)',
  borderStrong: 'var(--ts-borderStrong)',
  text: 'var(--ts-text)',
  textMuted: 'var(--ts-textMuted)',
  textFaint: 'var(--ts-textFaint)',
  textSubtle: 'var(--ts-textSubtle)',
  accent: 'var(--ts-accent)',
  accentSoft: 'var(--ts-accentSoft)',
  accentDeep: 'var(--ts-accentDeep)',
  accentHover: 'var(--ts-accentHover)',
  accentBorder: 'var(--ts-accentBorder)',
  success: 'var(--ts-success)',
  successSoft: 'var(--ts-successSoft)',
  successBorder: 'var(--ts-successBorder)',
  successDeep: 'var(--ts-successDeep)',
  warning: 'var(--ts-warning)',
  warningSoft: 'var(--ts-warningSoft)',
  warningBorder: 'var(--ts-warningBorder)',
  warningDeep: 'var(--ts-warningDeep)',
  danger: 'var(--ts-danger)',
  dangerSoft: 'var(--ts-dangerSoft)',
  onAccent: 'var(--ts-onAccent)',
  mark: 'var(--ts-mark)',
  fontMono:
    '"JetBrains Mono", "SF Mono", Menlo, Consolas, Monaco, monospace',
};

// @ts-ignore
const defaultShadows: Shadows = [
  'none',
  'var(--template-palette-baseShadow)',
  ...defaultTheme.shadows.slice(2),
];
export const shadows = defaultShadows;
