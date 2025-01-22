import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';

test.beforeEach(async ({ page }) => {
  await page.goto(pathToFileURL('actual-reports/report.html').href);
});

test('Fix with AI attachment (default prompt)', async ({ page }) => {
  await expect(page.getByText('Fix with AI')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open ChatGPT' })).toBeVisible();
  await page.getByRole('button', { name: 'Copy prompt' }).click();
  const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardContent).toContain('You are an expert');
  expect(clipboardContent).toContain('I am on homepage');
  expect(clipboardContent).toContain('I see header');
});

test('Fix with AI attachment (custom prompt)', async ({ page }) => {
  await expect(page.getByText('Fix with AI')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open ChatGPT' })).toBeVisible();
  await page.getByRole('button', { name: 'Copy prompt' }).click();
  const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardContent).toContain('my custom prompt');
});
