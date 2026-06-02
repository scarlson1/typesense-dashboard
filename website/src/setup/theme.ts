import { createTheme } from '@mui/material/styles'

// The marketing page styles itself with the design tokens in styles.css.
// This MUI theme exists so any MUI components added later share the brand.
export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: '#4ba0f5' },
    background: { default: '#0b0f17', paper: '#11161f' },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  shape: { borderRadius: 9 },
})
