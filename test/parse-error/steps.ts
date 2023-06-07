import { expect } from '@playwright/test';
import { createBDD } from '../../dist';

const { Given } = createBDD();

Given('some state', async ({ page }) => {
  expect(page).toBeDefined();
});
