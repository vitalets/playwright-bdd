import { test, expect, Page, Locator } from '@playwright/test';
import { pathToFileURL } from 'node:url';

test.describe('(default-prompt)', () => {
  test.beforeEach(async ({ page }) => {
    await openReport(page, 'actual-reports/default-prompt-cucumber/index.html');
  });

  test('Default page ok', async ({ page }) => {
    const scenario = getScenario(page, 'Default page ok');
    await expect(scenario).toBeVisible();
    const clipboardContent = await copyPromptToClipboard(scenario);
    expect(clipboardContent).toContain('You are an expert');
    expect(clipboardContent).toContain('I am on homepage');
    expect(clipboardContent).toContain('failing step');
  });

  // 'Custom page' and 'Default page closed' can be checkedonly in one report (pw)
  // test('Custom page', async ({ page }) => {
  //   const clipboardContent = await copyPromptToClipboard(page);
  //   expect(clipboardContent).toContain('failing step on custom page fixture');
  // });

  // test('Default page closed', async ({ page }) => {
  //   await expect(page.getByText(`expect('foo').toEqual('bar')`)).toBeVisible();
  //   await expect(page.getByText('Fix with AI')).not.toBeVisible();
  //   await expect(page.getByText('locator.ariaSnapshot')).not.toBeVisible();
  // });
});

test.describe('(custom-prompt)', () => {
  test.beforeEach(async ({ page }) => {
    await openReport(page, 'actual-reports/custom-prompt-cucumber/index.html');
  });

  test('Scenario 1', async ({ page }) => {
    const scenario = getScenario(page, 'Scenario 1');
    const clipboardContent = await copyPromptToClipboard(scenario);
    expect(clipboardContent).toContain('my custom prompt');
  });
});

async function openReport(page: Page, reportPath: string) {
  await page.goto(pathToFileURL(reportPath).href);
}

function getScenario(page: Page, scenarioName: string) {
  return page
    .locator('section section')
    .filter({ has: page.getByRole('heading', { name: scenarioName }) });
}

async function copyPromptToClipboard(scenario: Locator) {
  await expect(scenario.getByText('Fix with AI')).toBeVisible();
  await expect(scenario.getByRole('link', { name: 'Open ChatGPT' })).toBeVisible();
  await scenario.getByRole('button', { name: 'Copy prompt' }).click();

  return scenario.page().evaluate(() => navigator.clipboard.readText());
}
