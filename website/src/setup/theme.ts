import { createTheme } from '@mui/material/styles';

// Design color tokens mirrored from styles.css (:root = dark,
// [data-theme="light"] = light) into the MUI theme. With cssVariables on, these
// become theme.vars.palette.design.* / --mui-palette-design-* CSS variables
// that switch with the data-theme color scheme. styles.css keeps its own copies
// (nothing there is removed). Nested under `design` to avoid clobbering MUI's
// own palette.text / .success / .warning / .background.
interface DesignTokens {
  bg: string;
  bgDeep: string;
  surface: string;
  surface2: string;
  surfaceTinted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  textSubtle: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentBorder: string;
  accentDeep: string;
  success: string;
  successSoft: string;
  successBorder: string;
  warning: string;
  warningSoft: string;
  danger: string;
  codeSurface: string;
  codeText: string;
  onAccent: string;
  mark: string;
  chartSearch: string;
  chartImport: string;
  chartWrite: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    design: DesignTokens;
  }
  interface PaletteOptions {
    design?: DesignTokens;
  }
}

const darkDesign: DesignTokens = {
  bg: '#0b0f17',
  bgDeep: '#06080d',
  surface: '#11161f',
  surface2: '#161c27',
  surfaceTinted: '#0d1219',
  border: '#232a37',
  borderStrong: '#313a4a',
  text: '#e6ebf2',
  textMuted: '#a3aebd',
  textFaint: '#6f7a8a',
  textSubtle: '#4f5867',
  accent: '#4ba0f5',
  accentHover: '#6cb1ff',
  accentSoft: '#16263c',
  accentBorder: '#2c4b6f',
  accentDeep: '#cfe1f7',
  success: '#2bbf75',
  successSoft: '#122a1d',
  successBorder: '#1f3d2c',
  warning: '#e3a64f',
  warningSoft: '#2a200c',
  danger: '#ef4870',
  codeSurface: '#06080d',
  codeText: '#e1e7ed',
  onAccent: '#08111d',
  mark: '#3a2f0f',
  chartSearch: '#4ba0f5',
  chartImport: '#2bbf75',
  chartWrite: '#e3a64f',
};

const lightDesign: DesignTokens = {
  bg: '#ffffff',
  bgDeep: 'hsl(210, 36%, 97%)',
  surface: '#ffffff',
  surface2: 'hsl(210, 36%, 97%)',
  surfaceTinted: 'hsl(210, 33%, 99%)',
  border: 'hsl(218, 19%, 91%)',
  borderStrong: 'hsl(214, 13%, 79%)',
  text: 'hsl(213, 73%, 15%)',
  textMuted: 'hsl(212, 22%, 33%)',
  textFaint: 'hsl(210, 16%, 50%)',
  textSubtle: 'hsl(212, 13%, 68%)',
  accent: 'hsl(210, 95%, 44%)',
  accentHover: 'hsl(211, 93%, 37%)',
  accentSoft: 'hsl(213, 86%, 95%)',
  accentBorder: 'hsl(213, 78%, 84%)',
  accentDeep: 'hsl(212, 85%, 27%)',
  success: 'hsl(149, 86%, 33%)',
  successSoft: 'hsl(140, 56%, 93%)',
  successBorder: 'hsl(140, 49%, 84%)',
  warning: 'hsl(38, 90%, 39%)',
  warningSoft: 'hsl(45, 92%, 88%)',
  danger: 'hsl(345, 60%, 53%)',
  codeSurface: 'hsl(213, 73%, 15%)',
  codeText: '#e1e7ed',
  onAccent: '#ffffff',
  mark: '#fef3c7',
  // light theme inherits the chart colors from :root in styles.css
  chartSearch: '#4ba0f5',
  chartImport: '#2bbf75',
  chartWrite: '#e3a64f',
};

// The marketing page styles itself with the design tokens in styles.css
// (keyed off [data-theme="light"|"dark"]). We point MUI's CSS-variable color
// scheme at the SAME data-theme attribute, so a single <InitColorSchemeScript>
// drives both MUI and the design tokens — and any MUI components added later
// share the brand and respond to the theme toggle.
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-theme' },
  defaultColorScheme: 'dark',
  colorSchemes: {
    dark: {
      palette: {
        primary: { main: '#4ba0f5' },
        background: { default: '#0b0f17', paper: '#11161f' },
        design: darkDesign,
      },
    },
    light: {
      palette: {
        primary: { main: '#1d6fff' },
        design: lightDesign,
      },
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // fontSize: '1rem',
          // borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bolder',
        },
        // contained: {
        //   boxShadow: 'none',
        //   '&:hover': {
        //     boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
        //   },
        // },
        // outlined: {
        //   borderWidth: '2px',
        //   '&:hover': {
        //     borderWidth: '2px',
        //   },
        // },
      },
    },
  },
});
