import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';
import { AUTH_FILE } from '../../playwright.config';

Given('I am logged in as {string}', async ({ context }, userName: string) => {
  const storageState = AUTH_FILE.replace('{user}', userName);
  // context.setStorageState() is available since Playwright 1.59
  // and allows loading auth state into the existing context.
  // @ts-ignore - to compile this code in Playwright < 1.59
  await context.setStorageState(storageState);
});

Given('I am on homepage', async ({ page }) => {
  await page.goto('https://authenticationtest.com/');
});

Then('I see {string} in navigation panel', async ({ page }, text: string) => {
  await expect(page.getByRole('navigation')).toContainText(text);
});
