import { test as base, expect } from '@playwright/test';
import { Client } from 'typesense';
import { getCreds, type E2eCreds, type TsTarget } from './creds';

export interface TsOptions {
  /** Which Typesense version this project targets; set per-project in the config. */
  tsTarget: TsTarget;
}

interface TsFixtures {
  tsCreds: E2eCreds;
  tsClient: Client;
  /** Deep-link to the auth route with creds prefilled, submit, and wait for the dashboard. */
  login: (creds?: E2eCreds) => Promise<void>;
}

export const test = base.extend<TsOptions & TsFixtures>({
  tsTarget: ['v29', { option: true }],

  tsCreds: async ({ tsTarget }, use) => {
    await use(getCreds(tsTarget));
  },

  tsClient: async ({ tsCreds }, use) => {
    await use(
      new Client({
        nodes: [
          {
            host: tsCreds.node,
            port: tsCreds.port,
            protocol: tsCreds.protocol,
          },
        ],
        apiKey: tsCreds.apiKey,
        connectionTimeoutSeconds: 10,
      })
    );
  },

  login: async ({ page, tsCreds }, use) => {
    await use(async (creds = tsCreds) => {
      const params = new URLSearchParams({
        node: creds.node,
        port: String(creds.port),
        protocol: creds.protocol,
        apiKey: creds.apiKey,
        env: 'development',
      });
      // Hash router under basepath /typesense-dashboard; the auth route reads
      // these search params and prefills the form.
      await page.goto(`/typesense-dashboard/#/auth?${params.toString()}`);
      await page.getByRole('button', { name: /submit/i }).click();
      // On success the app redirects away from /auth.
      await expect(page).not.toHaveURL(/\/auth/);
    });
  },
});

export { expect };
