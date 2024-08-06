// See: https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
import { test as setup, expect } from '@playwright/test';
import { AUTH_FILE } from '../../playwright.config';

setup('authenticate', async ({ page }) => {
  await page.goto('https://authenticationtest.com/simpleFormAuth/');
  await page.getByLabel('E-Mail Address').fill('simpleForm@authenticationtest.com');
  await page.getByLabel('Password').fill('pa$$w0rd');
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByRole('link', { name: 'Sign Out' })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
