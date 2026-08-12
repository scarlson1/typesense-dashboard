import { expect, test } from './fixtures';

// v30 synonym sets are containers of many rules — the v29 → v30 migration puts
// a whole collection's synonyms into one set. Editing or deleting one rule
// must leave its siblings alone.

test('editing one rule in a multi-rule set leaves the siblings intact', async ({
  page,
  login,
  tsClient,
  tsTarget,
}, testInfo) => {
  test.skip(tsTarget !== 'v30', 'synonym sets are a v30 resource');

  const setName = `e2e_syn_${testInfo.workerIndex}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  // A set shaped like a migrated v29 collection: three rules, one set.
  await tsClient.synonymSets(setName).upsert({
    items: [
      { id: `${setName}_apt`, synonyms: ['apartment', 'flat'] },
      { id: `${setName}_shoe`, synonyms: ['shoe', 'sneaker'] },
      { id: `${setName}_car`, synonyms: ['car', 'automobile'] },
    ],
  });

  try {
    await login();
    await page.goto('/typesense-dashboard/#/synonyms');

    // Filter down to this test's set, then edit its first rule.
    await page.getByPlaceholder('Filter rules...').fill(setName);
    const row = page.locator(`text=${setName}_apt`).first();
    await expect(row).toBeVisible();
    await row.hover();
    await page.getByRole('button', { name: 'Edit' }).first().click();

    // Add a term and save.
    const termsBox = page.getByPlaceholder('e.g. apartment, flat, condo');
    await termsBox.fill('condo,');
    await page.getByRole('button', { name: /save changes/i }).click();

    await expect
      .poll(
        async () => {
          const set = await tsClient.synonymSets(setName).retrieve();
          return set.items.map((i) => i.id).sort();
        },
        { timeout: 10_000 },
      )
      .toEqual(
        [`${setName}_apt`, `${setName}_car`, `${setName}_shoe`].sort(),
      );

    const set = await tsClient.synonymSets(setName).retrieve();
    const edited = set.items.find((i) => i.id === `${setName}_apt`);
    expect(edited?.synonyms).toContain('condo');

    // Deleting a rule removes only that rule.
    await page.getByPlaceholder('Filter rules...').fill(`${setName}_shoe`);
    const shoeRow = page.locator(`text=${setName}_shoe`).first();
    await expect(shoeRow).toBeVisible();
    await shoeRow.hover();
    await page.getByRole('button', { name: 'Delete' }).first().click();

    await expect
      .poll(
        async () => {
          const after = await tsClient.synonymSets(setName).retrieve();
          return after.items.map((i) => i.id).sort();
        },
        { timeout: 10_000 },
      )
      .toEqual([`${setName}_apt`, `${setName}_car`].sort());
  } finally {
    await tsClient
      .synonymSets(setName)
      .delete()
      .catch(() => {});
  }
});

test('adding a rule to an existing set appends instead of replacing', async ({
  page,
  login,
  tsClient,
  tsTarget,
}, testInfo) => {
  test.skip(tsTarget !== 'v30', 'synonym sets are a v30 resource');

  const setName = `e2e_syn_add_${testInfo.workerIndex}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  await tsClient.synonymSets(setName).upsert({
    items: [{ id: `${setName}_existing`, synonyms: ['couch', 'sofa'] }],
  });

  try {
    await login();
    await page.goto('/typesense-dashboard/#/synonyms');

    await page.getByPlaceholder('e.g. product_synonyms').fill(setName);
    await page.getByPlaceholder('e.g. apartment_synonyms').fill(`${setName}_new`);
    await page.getByPlaceholder('e.g. apartment, flat, condo').fill('bike, bicycle,');
    await page.getByRole('button', { name: /add rule/i }).click();

    await expect
      .poll(
        async () => {
          const set = await tsClient.synonymSets(setName).retrieve();
          return set.items.map((i) => i.id).sort();
        },
        { timeout: 10_000 },
      )
      .toEqual([`${setName}_existing`, `${setName}_new`].sort());
  } finally {
    await tsClient
      .synonymSets(setName)
      .delete()
      .catch(() => {});
  }
});
