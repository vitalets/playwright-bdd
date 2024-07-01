import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ option2: string }>({
  option2: ['bar', { option: true }],
});

export const { Given } = createBdd(test);
