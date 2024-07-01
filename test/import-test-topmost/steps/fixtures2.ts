import { createBdd } from 'playwright-bdd';
import { test as base } from './fixtures1';

export const test = base.extend<{ option2: string }>({
  option2: ['bar', { option: true }],
});

export const { Given } = createBdd(test);
