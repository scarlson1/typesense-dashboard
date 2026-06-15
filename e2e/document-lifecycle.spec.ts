import { readFile } from 'node:fs/promises';
import { expect, test } from './fixtures';

// Covers the Phase-1 document lifecycle features: JSONL export, bulk
// delete/update by filter, and collection truncation. Every test gets its own
// seeded collection (fixture) because these flows are destructive.

test('exports the collection as a JSONL download', async ({
  page,
  login,
  seededCollection,
}) => {
  await login();
  await page.goto(
    `/typesense-dashboard/#/collections/${seededCollection}/documents/export`
  );

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export documents/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(
    new RegExp(`^${seededCollection}-.+\\.jsonl$`)
  );

  const path = await download.path();
  const lines = (await readFile(path, 'utf-8')).trim().split('\n');
  expect(lines).toHaveLength(3);
  for (const line of lines) {
    expect(() => JSON.parse(line)).not.toThrow();
  }
});

test('export honors filter_by', async ({ page, login, seededCollection }) => {
  await login();
  await page.goto(
    `/typesense-dashboard/#/collections/${seededCollection}/documents/export`
  );

  await page.getByLabel(/filter \(filter_by\)/i).fill('brand:=Lumen');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export documents/i }).click();
  const download = await downloadPromise;

  const path = await download.path();
  const lines = (await readFile(path, 'utf-8')).trim().split('\n');
  expect(lines).toHaveLength(2);
});

test('deletes documents matching a filter from the config page', async ({
  page,
  login,
  tsClient,
  seededCollection,
}) => {
  await login();
  await page.goto(
    `/typesense-dashboard/#/collections/${seededCollection}/config`
  );

  await page.getByLabel(/delete filter/i).fill('brand:=Lumen');
  await page.getByRole('button', { name: /preview & delete matches/i }).click();

  // The confirm dialog previews the match count on its accept button.
  await page.getByRole('button', { name: /delete 2 docs/i }).click();

  await expect
    .poll(async () => {
      const schema = await tsClient.collections(seededCollection).retrieve();
      return schema.num_documents;
    })
    .toBe(1);
});

test('updates documents matching a filter via the builder', async ({
  page,
  login,
  tsClient,
  seededCollection,
}) => {
  await login();
  await page.goto(
    `/typesense-dashboard/#/collections/${seededCollection}/config`
  );

  // Build one condition: brand = SeatCo (string fields default to "= equals").
  await page.getByRole('combobox', { name: 'Field' }).click();
  await page.getByRole('option', { name: 'brand', exact: true }).click();
  await page.getByLabel('Value', { exact: true }).fill('SeatCo');

  // The live preview reflects the composed (backtick-quoted) filter_by.
  await expect(page.getByText('brand:=`SeatCo`')).toBeVisible();

  // The document patch goes through the Monaco editor. Focus runs an auto-format
  // pass, so let it settle, then clear (retrying select-all+delete until the
  // editor is actually empty) and insertText the JSON in one shot — insertText
  // sidesteps Monaco's auto-closing of brackets/quotes.
  const editor = page.getByTestId('update-patch-editor');
  const lines = editor.locator('.view-lines');
  await editor.locator('.monaco-editor').click();
  await page.waitForTimeout(300);
  await page.keyboard.press('End');
  await expect(async () => {
    await page.keyboard.press('Backspace');
    expect((await lines.innerText()).replace(/\s/g, '')).toBe('');
  }).toPass({ timeout: 5000 });
  await page.keyboard.insertText('{ "price": 99.0 }');
  await expect(lines).toHaveText('{ "price": 99.0 }');

  await page.getByRole('button', { name: /preview & update matches/i }).click();

  await page.getByRole('button', { name: /update 1 docs/i }).click();

  await expect
    .poll(async () => {
      const doc = (await tsClient
        .collections(seededCollection)
        .documents('2')
        .retrieve()) as { price: number };
      return doc.price;
    })
    .toBe(99.0);
});

test('truncates the collection from the danger zone', async ({
  page,
  login,
  tsClient,
  seededCollection,
}) => {
  await login();
  await page.goto(
    `/typesense-dashboard/#/collections/${seededCollection}/config`
  );

  await page.getByRole('button', { name: /truncate collection/i }).click();

  // Type-the-name confirmation dialog.
  await page.getByPlaceholder(seededCollection).fill(seededCollection);
  await page.getByRole('button', { name: /submit/i }).click();

  await expect
    .poll(async () => {
      const schema = await tsClient.collections(seededCollection).retrieve();
      return schema.num_documents;
    })
    .toBe(0);

  // The schema survives truncation.
  const schema = await tsClient.collections(seededCollection).retrieve();
  expect(schema.fields?.length).toBeGreaterThan(0);
});
