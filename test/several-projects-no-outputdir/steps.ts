import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('State {int}', async ({ page, option }) => {
  expect(page).toBeDefined();
  expect(option).toBeDefined();
});
