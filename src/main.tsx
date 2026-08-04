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
  // The DSN ships in the bundle, so any clone running `pnpm dev` reports into
  // this project. Gate on PROD so only real builds send events. Init still runs
  // in dev, which keeps Sentry.captureException/setTag call sites as no-ops.
  enabled: import.meta.env.PROD,
  sendDefaultPii: false,
  environment: import.meta.env.DEV ? 'development' : 'production',
  // Monaco cancels in-flight work (completions, formatting, tokenization) as a
  // matter of course and surfaces it as a bare `Canceled` error. It is control
  // flow, not a fault. Anchored so it can't swallow real errors that merely
  // mention cancellation.
  ignoreErrors: [/^Canceled$/],
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

// A deploy replaces the hashed chunk files that an already-loaded index.html
// points at, so the next lazy import (monaco, split routes) rejects with
// "Importing a module script failed" / "Failed to fetch dynamically imported
// module". Reloading picks up the new manifest.
const STALE_CHUNK_RE =
  /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i;

const CHUNK_RELOAD_KEY = 'chunk-reload-attempted';

// One reload per tab session, deliberately never cleared: a chunk that is
// genuinely unreachable (offline, blocked, bad deploy) would otherwise reload
// forever. After the single attempt the error falls through to the boundary.
const reloadOnceForStaleChunk = (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  if (!STALE_CHUNK_RE.test(message)) return;
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). Without a
    // loop guard, don't reload at all.
    return;
  }
  window.location.reload();
};

// Vite dispatches a plain Event carrying the original error on `.payload`, and
// rethrows it when nothing calls preventDefault — so the rejection listener
// below may see it too. The one-shot guard makes the duplicate harmless.
window.addEventListener('vite:preloadError', (event) => {
  reloadOnceForStaleChunk((event as Event & { payload?: unknown }).payload);
});
window.addEventListener('unhandledrejection', (event) => {
  reloadOnceForStaleChunk(event.reason);
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
