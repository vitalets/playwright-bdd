import { expect } from '@playwright/test';
import { createBdd, test as base } from 'playwright-bdd';

export const test = base.extend<{ option: string }>({
  option: ['foo', { option: true }],
});

const { Given } = createBdd(test);

Given('State {int}', async ({ option }) => {
  expect(option).toEqual('foo');
});
