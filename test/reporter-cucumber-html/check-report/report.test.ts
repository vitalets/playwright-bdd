import { pathToFileURL } from 'node:url';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto(pathToFileURL('reports/report.html').href);
});

test('success scenarios', async ({ page }) => {
  await expect(page.getByText('5 passed')).toBeVisible();
  await expect(page.getByRole('button').filter({ hasText: 'sample.feature' })).toBeVisible();
  await expect(page.getByText('Scenario with different steps')).toBeVisible();
  await expect(page.getByText('Scenario with all keywords')).toBeVisible();
  await expect(page.getByText('Check doubled')).toBeVisible();
});

test('failed scenarios', async ({ page }) => {
  await expect(page.getByText('1 failed')).toBeVisible();
  await expect(
    page.getByText('Timed out 1ms waiting for expect(received).toBeVisible()'),
  ).toBeVisible();
  await expect(page.getByText(`waiting for getByText('missing string')`)).toBeVisible();
});

test('attachments', async ({ page }) => {
  // text attachment
  await expect(page.getByText('attach text', { exact: true })).toBeVisible();
  await page.getByText('text attachment').click();
  await expect(page.getByText('some text')).toBeVisible();

  // image attachment inline
  await expect(page.getByText('attach image inline', { exact: true })).toBeVisible();
  await page.getByText('image attachment inline').click();
  await expect(
    page
      .locator('css=details')
      .filter({ hasText: 'image attachment inline' })
      .getByAltText('Embedded Image'),
  ).toBeVisible();

  // image attachment as file
  await expect(page.getByText('attach image as file', { exact: true })).toBeVisible();
  await page.getByText('image attachment as file').click();
  await expect(
    page
      .locator('css=details')
      .filter({ hasText: 'image attachment as file' })
      .getByAltText('Embedded Image'),
  ).toBeVisible();

  // screenshot for failing step
  await expect(page.getByText('failing step', { exact: true })).toBeVisible();
  await page.getByText('screenshot').click();
  await expect(
    page.locator('css=details').filter({ hasText: 'screenshot' }).getByAltText('Embedded Image'),
  ).toBeVisible();
});
