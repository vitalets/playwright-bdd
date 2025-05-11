import { test, expect, Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';

test.beforeEach(async ({ page }) => {
  await page.goto(pathToFileURL('actual-reports/report.html').href);
});

test('Fix with AI attachment (default prompt)', async ({ page }) => {
  const clipboardContent = await copyPromptToClipboard(page);
  expect(clipboardContent).toContain('You are an expert');
  expect(clipboardContent).toContain('I am on homepage');
  expect(clipboardContent).toContain('I see header');
});

test('Fix with AI attachment (custom prompt)', async ({ page }) => {
  const clipboardContent = await copyPromptToClipboard(page);
  expect(clipboardContent).toContain('my custom prompt');
});

test('Fix with AI attachment (custom page)', async ({ page }) => {
  const clipboardContent = await copyPromptToClipboard(page);
  expect(clipboardContent).toContain('failing test on custom page fixture');
});

async function copyPromptToClipboard(page: Page) {
  await expect(page.getByText('Fix with AI')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open ChatGPT' })).toBeVisible();
  await page.getByRole('button', { name: 'Copy prompt' }).click();

  return page.evaluate(() => navigator.clipboard.readText());
}
