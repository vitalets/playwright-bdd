import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';

test('Fix with AI', async ({ page }) => {
  await page.goto(pathToFileURL('actual-reports/report.html').href);
  await page.getByRole('button', { name: 'Copy prompt' }).click();
  const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardContent).toContain('You are an expert');
  expect(clipboardContent).toContain('I am on homepage');
  expect(clipboardContent).toContain('I see header');
});
