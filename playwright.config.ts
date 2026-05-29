import { defineConfig, devices } from '@playwright/test';
import type { TsOptions } from './e2e/fixtures';

// E2E runs the dashboard against real Typesense instances (v29 + v30). Start
// the servers with `pnpm e2e:up` (or point at your own via TS_V29_*/TS_V30_*
// env vars), then `pnpm test:e2e`.
export default defineConfig<TsOptions>({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    ignoreHTTPSErrors: true, // tolerate self-signed certs on HTTPS clusters
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'v29',
      use: { ...devices['Desktop Chrome'], tsTarget: 'v29' },
    },
    {
      name: 'v30',
      use: { ...devices['Desktop Chrome'], tsTarget: 'v30' },
    },
  ],
  webServer: {
    command: 'pnpm dev --port 5173',
    url: 'http://localhost:5173/typesense-dashboard/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
