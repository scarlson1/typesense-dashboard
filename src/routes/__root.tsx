import { CssBaseline } from '@mui/material';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { DialogProvider, Toaster } from '../components';
import { AppTheme } from '../context';
import { dataGridCustomizations } from '../theme/customizations';

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
        {/* <CollectionProvider
          client={client}
          // collectionId={collectionId}
          clusterId={clusterId}
        > */}
        <DialogProvider>
          <Outlet />
        </DialogProvider>
        {/* </CollectionProvider> */}
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
