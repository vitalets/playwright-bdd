import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';

Given('I am on homepage', async ({ page }) => {
  await page.goto('https://authenticationtest.com/');
});

Then('I see {string} in navigation panel', async ({ page }, text: string) => {
  await expect(page.getByRole('navigation')).toContainText(text);
});
