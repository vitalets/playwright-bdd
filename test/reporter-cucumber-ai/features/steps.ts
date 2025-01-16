import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I am on Playwright homepage', async ({ page }) => {
  await page.goto('https://playwright.dev');
});

When('I click link {string}', async ({ page }, name: string) => {
  await page.getByRole('link', { name }).click();
});

Then('I see header {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible();
});
