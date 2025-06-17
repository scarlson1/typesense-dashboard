import type { ThemeOptions } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
// import { dataDisplayCustomizations } from '../theme/customizations/dataDisplay';
// import { feedbackCustomizations } from '../theme/customizations/feedback';
// import { inputsCustomizations } from '../theme/customizations/inputs';
// import { navigationCustomizations } from '../theme/customizations/navigation';
// import { surfacesCustomizations } from '../theme/customizations/surfaces';
import {
  colorSchemes,
  shadows,
  shape,
  typography,
} from '../theme/themePrimitives';

interface AppThemeProps {
  children: ReactNode;
  themeComponents?: ThemeOptions['components'];
}

export function AppTheme(props: AppThemeProps) {
  const { children, themeComponents } = props;

  const theme = useMemo(
    () =>
      createTheme({
        cssVariables: {
          colorSchemeSelector: 'data-mui-color-scheme',
          cssVarPrefix: '',
        },
        colorSchemes,
        typography,
        shadows,
        shape,
        components: {
          // ...inputsCustomizations,
          // ...dataDisplayCustomizations,
          // ...feedbackCustomizations,
          // ...navigationCustomizations,
          // ...surfacesCustomizations,
          ...(themeComponents || {}),
        },
      }),
    [themeComponents]
  );

  return (
    <ThemeProvider theme={theme} defaultMode='system' disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
