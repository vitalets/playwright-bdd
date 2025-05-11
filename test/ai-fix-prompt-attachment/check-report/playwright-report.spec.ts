import { test, expect, Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';

test.beforeEach(async ({ page }) => {
  await page.goto(pathToFileURL('playwright-report/index.html').href);
});

test('Fix with AI attachment (default prompt)', async ({ page }) => {
  const attachmentBody = await openPromptForScenario(page, 'validate header');
  await expect(attachmentBody).toContainText('You are an expert');
  await expect(attachmentBody).toContainText('I am on homepage');
  await expect(attachmentBody).toContainText('I see header');
});

test('Fix with AI attachment (custom prompt)', async ({ page }) => {
  const attachmentBody = await openPromptForScenario(page, 'validate header');
  await expect(attachmentBody).toContainText('my custom prompt');
});

test('Fix with AI attachment (custom page)', async ({ page }) => {
  const attachmentBody = await openPromptForScenario(page, 'Custom page');
  await expect(attachmentBody).toContainText('failing test on custom page fixture');
});

async function openPromptForScenario(page: Page, scenarioName: string) {
  await page.getByRole('link', { name: scenarioName }).click();
  await expect(page.getByText('Fix with AI')).toBeVisible();
  await page.getByText('Fix with AI').click();

  return page.locator('.attachment-body');
}
