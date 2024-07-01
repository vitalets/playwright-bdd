import { expect } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ option2: string }>({
  option2: ['bar', { option: true }],
});

const { Given } = createBdd(test);

Given('step 2', async ({ option2 }) => {
  expect(option2).toEqual('bar');
});
