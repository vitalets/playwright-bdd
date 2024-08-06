/**
 * Authenticate all users before test run.
 */
import { test as setup, expect, Page } from '@playwright/test';
import { AUTH_FILE } from '../../playwright.config';
import { users } from './users';

setup.describe.configure({ mode: 'parallel' });

setup('authenticate user1', async ({ page }) => {
  await authenticate(page, 'user1');
});

setup('authenticate user2', async ({ page }) => {
  await authenticate(page, 'user2');
});

async function authenticate(page: Page, userName: keyof typeof users) {
  const user = users[userName];

  await page.goto('https://authenticationtest.com/simpleFormAuth/');

  // in real app credentials will depend on email
  await page.getByLabel('E-Mail Address').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByRole('link', { name: 'Sign Out' })).toBeVisible();

  const authFile = AUTH_FILE.replace('{user}', userName);
  await page.context().storageState({ path: authFile });
}
