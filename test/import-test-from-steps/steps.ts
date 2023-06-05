import { expect } from '@playwright/test';
import { createBDD, test as base } from '../../dist';

export const test = base.extend<{ option: string }>({
  option: ['foo', { option: true }],
});

const { Given } = createBDD(test);

Given('State {int}', async ({ page, option }) => {
  expect(page).toBeDefined();
  expect(option).toBeDefined();
});
