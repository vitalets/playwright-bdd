import { expect } from '@playwright/test';
import { createBdd } from '../../dist';

const { Given } = createBdd();

Given('some state', async ({ page }) => {
  expect(page).toBeDefined();
});
