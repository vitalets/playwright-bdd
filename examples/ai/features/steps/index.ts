import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

Given('I am on home page', async ({ page }) => {
  await page.goto('https://playwright.dev');
});

When('I click link {string}', async ({ page }, name: string) => {
  await page.getByRole('link', { name }).click();
});

Then('I see header {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(text);
});
