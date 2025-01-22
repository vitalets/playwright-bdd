import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When } = createBdd();

When('Action {int}', () => {});

Given('failing step', async () => {
  expect(true).toBe(false);
});

Given('step with attachment', async ({ $testInfo }) => {
  await $testInfo.attach('step with attachment', {
    body: `|attachment for scenario ${$testInfo.title}`,
  });
});

// using 'page' here to have a screenshot in report
When('step with page', async ({ page }) => {
  return page;
});
