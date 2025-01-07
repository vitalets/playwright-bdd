import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';
import { AUTH_FILE } from '../../playwright.config';

Given('I am logged in as {string}', async ({ browser, ctx }, userName: string) => {
  const storageState = AUTH_FILE.replace('{user}', userName);
  const context = await browser.newContext({ storageState });
  ctx.page = await context.newPage();
});

Given('I am on homepage', async ({ ctx }) => {
  await ctx.page.goto('https://authenticationtest.com/');
});

Then('I see {string} in navigation panel', async ({ ctx }, text: string) => {
  await expect(ctx.page.getByRole('navigation')).toContainText(text);
});
