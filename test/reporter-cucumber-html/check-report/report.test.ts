import { pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto(pathToFileURL('reports/report.html').href);
});

test('general info about scenarios', async ({ page }) => {
  await expect(page.getByText('1 failed')).toBeVisible();
  await expect(page.getByText('5 passed')).toBeVisible();
  await expect(page.getByRole('button').filter({ hasText: 'sample.feature' })).toBeVisible();
  await expect(page.getByText('Scenario with different steps')).toBeVisible();
  await expect(page.getByText('Scenario with all keywords')).toBeVisible();
  await expect(page.getByText('Check doubled')).toBeVisible();
  // todo: better assert error details
  await expect(page.getByText('Error:')).toBeVisible();
});

test('attachments', async ({ page }) => {
  // text attachment
  await expect(page.getByText('attach text')).toBeVisible();
  await page.getByText('text attachment').click();
  await expect(page.getByText('some text')).toBeVisible();

  // image attachment inline
  await expect(page.getByText('attach image inline')).toBeVisible();
  await page.getByText('image attachment inline').click();
  await expect(
    page
      .locator('css=details')
      .filter({ hasText: 'image attachment inline' })
      .getByAltText('Embedded Image'),
  ).toBeVisible();

  // image attachment as file
  await expect(page.getByText('attach image as file')).toBeVisible();
  await page.getByText('image attachment as file').click();
  await expect(
    page
      .locator('css=details')
      .filter({ hasText: 'image attachment as file' })
      .getByAltText('Embedded Image'),
  ).toBeVisible();

  // screenshot for failing step
  await expect(page.getByText('failing step')).toBeVisible();
  await page.getByText('screenshot').click();
  await expect(
    page.locator('css=details').filter({ hasText: 'screenshot' }).getByAltText('Embedded Image'),
  ).toBeVisible();
});
