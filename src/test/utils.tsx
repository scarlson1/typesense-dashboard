import { AppTheme } from '@/context/AppTheme';
import { queryClient } from '@/utils/queryClient';
import { getCredsKey, typesenseStore, type TypesenseCreds } from '@/utils/typesenseStore';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react';
import { Component, Suspense, type ReactNode } from 'react';

export const testCreds: TypesenseCreds = {
  name: 'test',
  node: 'localhost',
  port: 8108,
  protocol: 'http',
  apiKey: 'test-key',
};

// Base URL the Typesense client will hit for `testCreds`; MSW handlers match it.
export const TS_BASE = getCredsKey(testCreds); // http://localhost:8108

/** Seed the Zustand store so `useTypesenseClient` resolves an authenticated client. */
export const setStoreCreds = (creds: TypesenseCreds = testCreds) => {
  const key = getCredsKey(creds);
  typesenseStore.setState({
    credentials: { [key]: creds },
    currentCredsKey: key,
  });
  return key;
};

/**
 * Reset shared singletons between tests. Hooks invalidate via the imported
 * `queryClient` singleton, so we provide that same instance and clear it here.
 */
export const resetTestState = () => {
  // Unmount first: mounted hooks subscribe to the store and would re-render
  // (and throw the auth redirect) the moment we clear it.
  cleanup();
  queryClient.clear();
  typesenseStore.setState({ credentials: {}, currentCredsKey: null });
};

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AppTheme>
      <Suspense fallback={null}>{children}</Suspense>
    </AppTheme>
  </QueryClientProvider>
);

export const renderHookWithProviders = <Result, Props>(
  cb: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>
) => renderHook(cb, { wrapper: Providers, ...options });

/** Render a component inside the app's theme, a query client and a Suspense boundary. */
export const renderWithProviders = (
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: Providers, ...options });

class CaptureBoundary extends Component<
  { onError: (e: unknown) => void; children: ReactNode },
  { errored: boolean }
> {
  state = { errored: false };
  static getDerivedStateFromError() {
    return { errored: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  render() {
    return this.state.errored ? null : this.props.children;
  }
}

/**
 * Render a hook that is expected to throw during render (e.g. the auth
 * redirect) and return whatever it threw. Using an error boundary keeps React
 * from reporting the throw as an unhandled error.
 */
export const captureHookThrow = (hook: () => unknown): unknown => {
  let captured: unknown;
  renderHook(() => hook(), {
    wrapper: ({ children }) => (
      <CaptureBoundary onError={(e) => (captured = e)}>{children}</CaptureBoundary>
    ),
  });
  return captured;
};

export { queryClient };
