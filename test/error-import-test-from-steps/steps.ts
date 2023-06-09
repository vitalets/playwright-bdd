import { expect } from '@playwright/test';
import { createBdd, test as base } from '../../dist';

export const test = base.extend<{ option: string }>({
  option: ['foo', { option: true }],
});

const { Given } = createBdd(test);

Given('State {int}', async ({ page, option }) => {
  expect(page).toBeDefined();
  expect(option).toBeDefined();
});
