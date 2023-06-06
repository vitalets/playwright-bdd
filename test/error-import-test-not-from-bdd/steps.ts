import { expect } from '@playwright/test';
import { createBDD } from '../../dist';
import { test } from './fixtures';

const { Given } = createBDD(test);

Given('State {int}', async ({ page, option }) => {
  expect(page).toBeDefined();
  expect(option).toBeDefined();
});
