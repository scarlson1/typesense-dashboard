import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';

// monaco-editor is pulled in transitively via the `@/constants` barrel but is
// never exercised in unit/hook tests; stub it so its browser-API probing
// doesn't crash jsdom on import.
vi.mock('monaco-editor', () => ({ editor: {}, languages: {}, Uri: {} }));

// MUI components read matchMedia; jsdom doesn't implement it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// Fail loudly on requests that aren't mocked, so a forgotten handler surfaces
// as a clear error rather than a confusing timeout.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  // Zustand persists to sessionStorage; clear between tests for isolation.
  sessionStorage.clear();
  localStorage.clear();
});

afterAll(() => server.close());
