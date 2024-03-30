import { test, expect } from '@playwright/test';
import { getFeature, openReport } from './helpers';
import { getPackageVersion } from '../../../src/utils';

const pwVersion = getPackageVersion('@playwright/test');

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('header info', async ({ page }) => {
  // after changing this counts you should also update test/reporter-cucumber-junit
  let failed = 14;
  let passed = 7;

  // See: link to issue
  if (pwVersion.startsWith('1.43.')) {
    failed--;
    passed++;
  }

  await expect(page.getByText(/\d+ failed/)).toHaveText(`${failed} failed`);
  await expect(page.getByText(/\d+ passed/)).toHaveText(`${passed} passed`);
  await expect(page.getByText(/\d+ executed/)).toHaveText(`${failed + passed} executed`);

  await expect(page.locator('dl').getByText('node.js')).toBeVisible();
  await expect(page.locator('dl').getByText('playwright-bdd')).toBeVisible();

  await expect(getFeature(page).getTags()).toHaveText(['@feature-tag']);
});
