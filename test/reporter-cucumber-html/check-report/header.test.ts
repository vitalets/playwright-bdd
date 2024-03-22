import { test, expect } from '@playwright/test';
import { getFeature, openReport } from './helpers';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('header info', async ({ page }) => {
  // after changing this you should also update test/reporter-cucumber-junit
  await expect(page.getByText('11 failed')).toBeVisible();
  await expect(page.getByText('7 passed')).toBeVisible();
  await expect(page.getByText('18 executed')).toBeVisible();

  await expect(page.locator('dl').getByText('node.js')).toBeVisible();
  await expect(page.locator('dl').getByText('playwright-bdd')).toBeVisible();

  await expect(getFeature(page).getTags()).toHaveText(['@feature-tag']);
});
