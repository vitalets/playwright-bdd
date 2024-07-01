import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ option1: string }>({
  option1: ['foo', { option: true }],
});

export const { Given } = createBdd(test);
