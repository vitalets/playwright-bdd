import { pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto(pathToFileURL('reports/report.html').href);
  await page.getByText('sample.feature').click();
});

test('general info about runScenarioHooks', async ({ page }) => {
  await expect(page.getByText('5 passed')).toBeVisible();
  await expect(page.getByText('sample.feature')).toBeVisible();
  await expect(page.getByText('Scenario with different steps')).toBeVisible();
  await expect(page.getByText('Scenario with all keywords')).toBeVisible();
  await expect(page.getByText('Check doubled')).toBeVisible();
});

test('attachments', async ({ page }) => {
  // text attachment
  await expect(page.getByText('attach text')).toBeVisible();
  await page.getByText('text attachment').click();
  await expect(page.getByText('some text')).toBeVisible();
  // image attachment
  await expect(page.getByText('attach image inline')).toBeVisible();
  await page.getByText('image attachment inline').click();
  await expect(page.getByAltText('Embedded Image')).toBeVisible();
});
