import { test, expect, Page, Locator } from '@playwright/test';
import { pathToFileURL } from 'node:url';

test.describe('(default-prompt)', () => {
  test.beforeEach(async ({ page }) => {
    await openReport(page, 'actual-reports/default-prompt-cucumber/index.html');
  });

  test('Default page ok', async ({ page }) => {
    const scenario = getScenario(page, 'Default page ok');
    await expect(scenario).toBeVisible();
    await assertFixWithAiAttachment(scenario, 'You are an expert');
  });

  // 'Custom page' and 'Default page closed' can be checked only in one report (pw)
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
    await assertFixWithAiAttachment(scenario, 'my custom prompt');
  });
});

async function openReport(page: Page, reportPath: string) {
  await page.goto(pathToFileURL(reportPath).href);
}

function getScenario(page: Page, scenarioName: string) {
  return page
    .locator('section section')
    .filter({ hasNot: page.getByRole('heading', { level: 1 }) })
    .filter({ has: page.getByRole('heading', { name: scenarioName }) });
}

async function assertFixWithAiAttachment(scenario: Locator, prompt: string) {
  await scenario.getByRole('button', { name: '1 hooks' }).click();

  const firstAttachment = scenario.locator('details').first();
  await expect(firstAttachment).toContainText('Fix with AI');
  await expect(firstAttachment).toContainText(prompt);
}
