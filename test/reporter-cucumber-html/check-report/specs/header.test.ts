import { test, expect } from '@playwright/test';
import { getFeature, openReport } from '../helpers';

// after changing this counts you should also update test/reporter-cucumber-junit
const failed = 14;
const passed = 8;
const skipped = 1;

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('header info', async ({ page }) => {
  await expect(page.getByText(/\d+ failed/)).toHaveText(`${failed} failed`);
  await expect(page.getByText(/\d+ passed/)).toHaveText(`${passed} passed`);
  await expect(page.getByText(/\d+ skipped/)).toHaveText(`${skipped} skipped`);
  await expect(page.getByText(/\d+ executed/)).toHaveText(`${failed + passed + skipped} executed`);

  await expect(page.locator('dl').getByText('node.js')).toBeVisible();
  await expect(page.locator('dl').getByText('playwright-bdd')).toBeVisible();

  await expect(getFeature(page).getTags()).toHaveText(['@feature-tag']);
});
