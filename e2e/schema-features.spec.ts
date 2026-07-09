import { expect, test } from './fixtures';

// Phase-3 schema features: creating a collection with a reference (JOIN)
// field through the new-collection form, and the schema views rendering it.

test('creates a collection with a reference field via the form', async ({
  page,
  login,
  tsClient,
  seededCollection,
}, testInfo) => {
  const reviews = `e2e_reviews_${testInfo.workerIndex}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  try {
    await login();
    await page.goto('/typesense-dashboard/#/collections/new');

    await page.getByPlaceholder('e.g. products').fill(reviews);

    // Field 1: body (string)
    await page.getByPlaceholder('field_name').first().fill('body');
    await page.getByText('type *').click();
    await page.getByRole('option', { name: 'string', exact: true }).click();

    // Field 2: product_id (string) referencing <seededCollection>.id
    await page.getByRole('button', { name: /add field/i }).click();
    await page.getByPlaceholder('field_name').nth(1).fill('product_id');
    await page.getByText('type *').click();
    await page.getByRole('option', { name: 'string', exact: true }).click();

    await page.getByText('Reference (JOIN)').nth(1).click();
    await page
      .getByRole('option', { name: seededCollection, exact: true })
      .click();
    await page.getByText('referenced field *').click();
    await page.getByRole('option', { name: 'id', exact: true }).click();

    await page.getByRole('button', { name: /create collection/i }).click();

    // The reference made it into the live schema.
    await expect
      .poll(
        async () => {
          try {
            const schema = await tsClient.collections(reviews).retrieve();
            return schema.fields?.find((f) => f.name === 'product_id')
              ?.reference;
          } catch {
            return undefined;
          }
        },
        { timeout: 10_000 }
      )
      .toBe(`${seededCollection}.id`);

    // The schema view renders the reference as a link to the referenced
    // collection's config page.
    await page.goto(`/typesense-dashboard/#/collections/${reviews}/config`);
    const refLink = page.getByRole('link', {
      name: `${seededCollection}.id`,
    });
    await expect(refLink.first()).toBeVisible();
  } finally {
    try {
      await tsClient.collections(reviews).delete();
    } catch {
      // never created — fine
    }
  }
});
