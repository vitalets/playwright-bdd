import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('some state', async ({ page }) => {
  expect(page).toBeDefined();
});
