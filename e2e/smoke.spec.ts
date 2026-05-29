import { E2E_COLLECTION } from './creds';
import { seedProducts } from './seed';
import { expect, test } from './fixtures';

// Smoke flows run against both v29 and v30 (see the project matrix in
// playwright.config.ts). Seed before each test so the data is independent of
// run order.
test.beforeEach(async ({ tsClient }) => {
  await seedProducts(tsClient);
});

test('logs in with prefilled credentials and reaches the dashboard', async ({
  page,
  login,
}) => {
  await login();
  // We left the auth route; the app shell should be present.
  await expect(page).not.toHaveURL(/\/auth/);
});

test('lists the seeded collection', async ({ page, login }) => {
  await login();
  await page.goto(`/typesense-dashboard/#/collections`);
  await expect(page.getByText(E2E_COLLECTION).first()).toBeVisible();
});

test('searches documents in the seeded collection', async ({ page, login }) => {
  await login();
  await page.goto(
    `/typesense-dashboard/#/collections/${E2E_COLLECTION}/documents/search`
  );
  // A seeded document should surface on the search view.
  await expect(page.getByText('Nimbus Office Chair').first()).toBeVisible();
});
