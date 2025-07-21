import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CircularProgress } from '@mui/material';
import * as Sentry from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { routeTree } from './routeTree.gen';
import { queryClient } from './utils';

Sentry.init({
  dsn: 'https://b293b3e281f37fe75bbdea7a52489a24@o4509429931442176.ingest.us.sentry.io/4509673463808000',
  sendDefaultPii: true,
  environment: import.meta.env.DEV ? 'development' : 'production',
  // release: "<release_name>",
  // integrations: [
  //   Sentry.browserTracingIntegration(),
  //   Sentry.browserProfilingIntegration(),
  //   Sentry.replayIntegration(),
  // ],
  // replaysSessionSampleRate: 0.05,
  // replaysOnErrorSampleRate: 0.5,
});

const router = createRouter({
  routeTree,
  basepath: '/typesense-dashboard',
  scrollRestoration: true,
  defaultPreload: 'intent',
  // context: {
  //   user: undefined,
  // },
  defaultPendingComponent: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <CircularProgress size={24} />
    </div>
  ),
  Wrap: function WrapComponent({ children }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    crumb?: string;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary
        FallbackComponent={LastResortErrorBoundary}
        // TODO: log errors to cloud project (Google)
        onError={(err: Error) => {
          Sentry.captureException(err);
        }}
      >
        {/* <DialogProvider> */}
        <RouterProvider router={router} />
        {/* </DialogProvider> */}
      </ErrorBoundary>
    </StrictMode>
  );
}

function LastResortErrorBoundary({ error }: FallbackProps) {
  let msg =
    error && error.message ? (
      <div>
        <pre>{error.message}</pre>
      </div>
    ) : null;

  return (
    <div
      style={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}
      role='alert'
    >
      <p>An error occurred. See console for details.</p>
      {msg}
    </div>
  );
}
