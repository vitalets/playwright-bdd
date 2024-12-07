import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When } = createBdd();

When('Action {int}', () => {});

Given('failing step', async ({ page }) => {
  // using 'page' here to have a screenshot in report
  await page.goto('https://example.com');
  await expect(page.getByText('missing string')).toBeVisible();
});

// using 'page' here to have a screenshot in report
When('step with page', async ({ page }) => {
  return page;
});

When('open example.com', async ({ page }) => {
  await page.goto('https://example.com');
});
