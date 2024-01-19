import { pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';

test('html report should contain correct values', async ({ page }) => {
  await page.goto(pathToFileURL('reports/report.html').href);

  await expect(page.getByText('5 passed')).toBeVisible();
  await expect(page.getByText('sample.feature')).toBeVisible();
  await page.getByText('sample.feature').click();
  await expect(page.getByText('Scenario with different steps')).toBeVisible();
  await expect(page.getByText('Scenario with all keywords')).toBeVisible();
  await expect(page.getByText('Check doubled')).toBeVisible();
});
