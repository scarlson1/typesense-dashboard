import { expect, test } from './fixtures';

// Phase-5 analytics events: sending events from the dashboard and listing
// recent events. Requires the e2e Typesense servers to run with
// --enable-search-analytics=true and --analytics-dir set.

test('sends a click event and lists it in recent events (v30)', async ({
  page,
  login,
  tsClient,
  tsTarget,
  seededCollection,
}, testInfo) => {
  test.skip(tsTarget !== 'v30', 'log rules + event listing are v30 features');

  const ruleName = `e2e_click_${testInfo.workerIndex}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  await tsClient.analytics.rules().create({
    name: ruleName,
    type: 'log',
    collection: seededCollection,
    event_type: 'click',
  });

  try {
    await login();
    await page.goto('/typesense-dashboard/#/analytics');

    // Send card (left): post a click event the way an app would.
    await page.getByLabel('Event name').first().fill(ruleName);
    await page.getByLabel(/user id/i).first().fill('e2e-user');
    await page.getByLabel('Document ID').fill('1');
    await page.getByRole('button', { name: /send event/i }).click();
    await expect(page.getByText(`event sent [${ruleName}]`)).toBeVisible();

    // Recent-events viewer (right): the event shows up without waiting for
    // the analytics flush interval.
    await page.getByLabel(/user id/i).nth(1).fill('e2e-user');
    await page.getByLabel('Event name').nth(1).fill(ruleName);
    // Close the autocomplete dropdown so it doesn't cover the footer button.
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /fetch events/i }).click();

    const row = page.getByTestId('analytics-event-row').first();
    await expect(row).toBeVisible();
    await expect(row).toContainText('click');
  } finally {
    try {
      await tsClient.analytics.rules(ruleName).delete();
    } catch {
      // already gone — fine
    }
  }
});

test('sends a counter click event (v29)', async ({
  page,
  login,
  tsClient,
  tsTarget,
  seededCollection,
}, testInfo) => {
  test.skip(tsTarget !== 'v29', 'covers the legacy analyticsV1 event shape');

  const ruleName = `e2e_counter_${testInfo.workerIndex}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const eventName = `${ruleName}_event`;

  // Counter rules increment an int32 field on the source collection.
  await tsClient.collections(seededCollection).update({
    fields: [{ name: 'popularity', type: 'int32', optional: true }],
  });
  await tsClient.analyticsV1.rules().upsert(ruleName, {
    type: 'counter',
    params: {
      source: {
        collections: [seededCollection],
        events: [{ type: 'click', weight: 1, name: eventName }],
      },
      destination: { collection: seededCollection, counter_field: 'popularity' },
    },
  });

  try {
    await login();
    await page.goto('/typesense-dashboard/#/analytics');

    // v29 counter rules receive events under the rule's named event.
    await page.getByLabel('Event name').first().fill(eventName);
    await page.getByLabel(/user id/i).first().fill('e2e-user');
    await page.getByLabel('Document ID').fill('1');
    await page.getByRole('button', { name: /send event/i }).click();

    await expect(page.getByText(`event sent [${eventName}]`)).toBeVisible();
  } finally {
    try {
      await tsClient.analyticsV1.rules(ruleName).delete();
    } catch {
      // already gone — fine
    }
  }
});
