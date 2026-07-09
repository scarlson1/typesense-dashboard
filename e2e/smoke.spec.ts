import { expect, test } from './fixtures';

// Smoke flows run against both v29 and v30 (see the project matrix in
// playwright.config.ts). Each test seeds its own uniquely named collection
// via the `seededCollection` fixture, so parallel tests never interfere.

test('logs in with prefilled credentials and reaches the dashboard', async ({
  page,
  login,
}) => {
  await login();
  // We left the auth route; the app shell should be present.
  await expect(page).not.toHaveURL(/\/auth/);
});

test('lists the seeded collection', async ({
  page,
  login,
  seededCollection,
}) => {
  await login();
  await page.goto(`/typesense-dashboard/#/collections`);
  await expect(page.getByText(seededCollection).first()).toBeVisible();
});

test('searches documents in the seeded collection', async ({
  page,
  login,
  seededCollection,
}) => {
  await login();
  await page.goto(
    `/typesense-dashboard/#/collections/${seededCollection}/documents/search`
  );
  // A seeded document should surface on the search view.
  await expect(page.getByText('Nimbus Office Chair').first()).toBeVisible();
});
