import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';
import { AUTH_FILE } from '../../playwright.config';

Given('I am logged in as {string}', async ({ browser, authUser }, userName: string) => {
  const storageState = AUTH_FILE.replace('{user}', userName);
  const context = await browser.newContext({ storageState });
  authUser.page = await context.newPage();
});

Given('I am on homepage', async ({ authUser }) => {
  await authUser.page.goto('https://authenticationtest.com/');
});

Then('I see {string} in navigation panel', async ({ authUser }, text: string) => {
  await expect(authUser.page.getByRole('navigation')).toContainText(text);
});
