import { DialogProvider } from '@/components/DialogContext';
import { Toaster } from '@/components/Toaster';
import { AppTheme } from '@/context';
import {
  dataDisplayCustomizations,
  dataGridCustomizations,
  inputCustomizations,
  surfacesCustomizations,
} from '@/theme/customizations';
import { CssBaseline } from '@mui/material';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export interface RouterAppContext {
  // trpcQueryUtils: typeof trpcQueryUtils;
  // user: User | null | undefined;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  // errorComponent: (props) => {
  //   return (
  //     <RootDocument>
  //       <DefaultCatchBoundary {...props} />
  //     </RootDocument>
  //   );
  // },
  staticData: {
    crumb: 'Dashboard',
  },
});

const xThemeComponents = {
  ...surfacesCustomizations,
  ...inputCustomizations,
  ...dataDisplayCustomizations,
  // ...chartsCustomizations,
  ...dataGridCustomizations,
  // ...datePickersCustomizations,
  // ...treeViewCustomizations,
};

function RootComponent(props: { disableCustomTheme?: boolean }) {
  // const isFetching = useRouterState({ select: (s) => s.isLoading })

  return (
    <>
      <AppTheme {...props} themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        <DialogProvider>
          <Outlet />
        </DialogProvider>
        <Toaster />
      </AppTheme>
      {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
      <ReactQueryDevtools position='bottom' buttonPosition='bottom-right' />
    </>
  );
}

// export const Route = createRootRoute({
//   component: () => (
//     <>
//       <AppTheme {...props} themeComponents={xThemeComponents}>
//         <CssBaseline enableColorScheme />
//         <Outlet />
//         <Toaster />
//       </AppTheme>
//       {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
//       <ReactQueryDevtools position='bottom' buttonPosition='bottom-right' />
//     </>
//   ),
// });
