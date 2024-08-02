import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';

Given('I am on homepage', async ({ page }) => {
  await page.goto('https://authenticationtest.com/');
});

Then('I see link {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('link', { name })).toBeVisible();
});
