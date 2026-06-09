import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';
import { CircularProgress } from '@mui/material';
import * as Sentry from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { routeTree } from './routeTree.gen';
import { queryClient } from './utils';
import { typesenseStore } from './utils/typesenseStore';

// Keys whose *values* are secrets, regardless of where they appear.
const SENSITIVE_KEY_RE =
  /api[-_]?key|x-typesense-api-key|authorization|password|token|cookie/i;

// Collect the live secret values so we can redact them even if they end up
// embedded in a message/stack/URL string rather than as their own field.
const secretValues = (): string[] => {
  const { credentials } = typesenseStore.getState();
  return Object.values(credentials)
    .map((c) => c.apiKey)
    .filter(Boolean);
};

const scrub = (input: unknown, secrets: string[]): unknown => {
  if (typeof input === 'string') {
    return secrets.reduce(
      (acc, s) => (s ? acc.split(s).join('[Filtered]') : acc),
      input,
    );
  }
  if (Array.isArray(input)) return input.map((v) => scrub(v, secrets));
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [
        k,
        SENSITIVE_KEY_RE.test(k) ? '[Filtered]' : scrub(v, secrets),
      ]),
    );
  }
  return input;
};

Sentry.init({
  dsn: 'https://b293b3e281f37fe75bbdea7a52489a24@o4509429931442176.ingest.us.sentry.io/4509673463808000',
  sendDefaultPii: false,
  environment: import.meta.env.DEV ? 'development' : 'production',
  beforeSend: (event) => scrub(event, secretValues()) as typeof event,
  beforeBreadcrumb: (crumb) => scrub(crumb, secretValues()) as typeof crumb,
  // release: "<release_name>",
  // integrations: [
  //   Sentry.browserTracingIntegration(),
  //   Sentry.browserProfilingIntegration(),
  //   Sentry.replayIntegration(),
  // ],
  // replaysSessionSampleRate: 0.05,
  // replaysOnErrorSampleRate: 0.5,
});

const hashHistory = createHashHistory();

// Derive the router basepath from the Vite base so it stays in sync across hosts
// (GitHub Pages -> '/typesense-dashboard', root-domain hosts -> '/'). Web hosts
// use an absolute base; Electron uses a relative one ('./') for file:// loading,
// which has no meaningful URL prefix, so collapse it to '/'.
const rawBase = import.meta.env.BASE_URL;
const basepath = rawBase.startsWith('/')
  ? rawBase.replace(/\/$/, '') || '/'
  : '/';

const router = createRouter({
  routeTree,
  basepath,
  scrollRestoration: true,
  defaultPreload: 'intent',
  history: hashHistory,
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
        onError={(err: unknown) => {
          Sentry.captureException(err);
        }}
      >
        {/* <DialogProvider> */}
        <RouterProvider router={router} />
        {/* </DialogProvider> */}
      </ErrorBoundary>
    </StrictMode>,
  );
}

function LastResortErrorBoundary({ error }: FallbackProps) {
  const msg =
    error && error instanceof Error ? (
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
