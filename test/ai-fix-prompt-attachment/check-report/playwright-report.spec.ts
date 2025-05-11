import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';

test.beforeEach(async ({ page }) => {
  await page.goto(pathToFileURL('playwright-report/index.html').href);
});

test('Fix with AI attachment (default prompt)', async ({ page }) => {
  await page.getByRole('link', { name: 'validate header' }).click();

  await expect(page.getByText('Fix with AI')).toBeVisible();
  await page.getByText('Fix with AI').click();

  const attachmentBody = page.locator('.attachment-body');
  await expect(attachmentBody).toContainText('You are an expert');
  await expect(attachmentBody).toContainText('I am on homepage');
  await expect(attachmentBody).toContainText('I see header');
});

test('Fix with AI attachment (custom prompt)', async ({ page }) => {
  await page.getByRole('link', { name: 'validate header' }).click();

  await expect(page.getByText('Fix with AI')).toBeVisible();
  await page.getByText('Fix with AI').click();

  const attachmentBody = page.locator('.attachment-body');
  await expect(attachmentBody).toContainText('my custom prompt');
});

test('Fix with AI attachment (custom page)', async ({ page }) => {
  await page.getByRole('link', { name: 'Scenario 1' }).click();

  await expect(page.getByText('Fix with AI')).toBeVisible();
  await page.getByText('Fix with AI').click();

  const attachmentBody = page.locator('.attachment-body');
  await expect(attachmentBody).toContainText('failing test on custom page fixture');
});
