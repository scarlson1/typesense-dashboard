import { test as base, expect } from '@playwright/test';
import { Client } from 'typesense';
import { getCreds, type E2eCreds, type TsTarget } from './creds';
import { seedProducts } from './seed';

export interface TsOptions {
  /** Which Typesense version this project targets; set per-project in the config. */
  tsTarget: TsTarget;
}

interface TsFixtures {
  tsCreds: E2eCreds;
  tsClient: Client;
  /** Deep-link to the auth route with creds prefilled, submit, and wait for the dashboard. */
  login: (creds?: E2eCreds) => Promise<void>;
  /**
   * Name of a freshly seeded collection unique to this test. Tests run fully
   * parallel against a shared cluster, so destructive tests must never share
   * a collection. Cleaned up after the test.
   */
  seededCollection: string;
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

  seededCollection: async ({ tsClient }, use, testInfo) => {
    const name = `e2e_products_${testInfo.workerIndex}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    await seedProducts(tsClient, name);
    await use(name);
    try {
      await tsClient.collections(name).delete();
    } catch {
      // already deleted by the test — fine
    }
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
      await page.getByRole('button', { name: /connect to cluster/i }).click();
      // On success the app redirects away from /auth.
      await expect(page).not.toHaveURL(/\/auth/);
    });
  },
});

export { expect };
