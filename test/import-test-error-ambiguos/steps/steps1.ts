import { expect } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ option1: string }>({
  option1: ['foo', { option: true }],
});

const { Given } = createBdd(test);

Given('step 1', async ({ option1 }) => {
  expect(option1).toEqual('foo');
});
