import { test, expect } from '@playwright/test';
import { openReport } from './helpers';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('passed / failed / executed', async ({ page }) => {
  await expect(page.getByText('8 failed')).toBeVisible();
  await expect(page.getByText('10 passed')).toBeVisible();
  await expect(page.getByText('18 executed')).toBeVisible();
});

test('meta', async ({ page }) => {
  await expect(page.locator('dl').getByText('node.js')).toBeVisible();
  await expect(page.locator('dl').getByText('playwright-bdd')).toBeVisible();
});
