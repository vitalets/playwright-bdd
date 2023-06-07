import { expect } from '@playwright/test';
import { createBDD } from '../../dist/index.js';
import { test } from './fixtures.js';

const { Given } = createBDD(test);

Given('State {int}', async ({ page, option }) => {
  expect(page).toBeDefined();
  expect(option).toBeDefined();
});
