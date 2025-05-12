import { test, expect, Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';

test.describe('(default-prompt)', () => {
  test.beforeEach(async ({ page }) => {
    await openReport(page, `actual-reports/default-prompt-pw/index.html`);
  });

  test('Default page ok', async ({ page }) => {
    await openScenario(page, 'Default page ok');
    const prompt = await getPrompt(page);
    await expect(prompt).toContainText('You are an expert');
    await expect(prompt).toContainText('I am on homepage');
    await expect(prompt).toContainText('failing step');
  });

  test('Default page closed', async ({ page }) => {
    await openScenario(page, 'Default page closed');
    await expect(page.getByText(`expect('foo').toEqual('bar')`)).toBeVisible();
    await expect(page.getByText('Fix with AI')).not.toBeVisible();
    await expect(page.getByText('locator.ariaSnapshot')).not.toBeVisible();
  });

  test('Custom page', async ({ page }) => {
    await openScenario(page, 'Custom page');
    await expect(await getPrompt(page)).toContainText('failing step on custom page fixture');
  });
});

test.describe('(custom-prompt)', () => {
  test.beforeEach(async ({ page }) => {
    await openReport(page, `actual-reports/custom-prompt-pw/index.html`);
  });

  test('Scenario 1', async ({ page }) => {
    await openScenario(page, 'Scenario 1');
    await expect(await getPrompt(page)).toContainText('my custom prompt');
  });
});

async function openReport(page: Page, reportPath: string) {
  await page.goto(pathToFileURL(reportPath).href);
}

async function openScenario(page: Page, scenarioName: string) {
  await page.getByRole('link', { name: scenarioName }).click();
}

async function getPrompt(page: Page) {
  await expect(page.getByText('Fix with AI')).toBeVisible();
  await page.getByText('Fix with AI').click();

  return page.locator('.attachment-body');
}
