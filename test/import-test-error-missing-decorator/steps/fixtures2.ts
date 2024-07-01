import { test as base } from 'playwright-bdd';

export const test = base.extend<{ option2: string }>({
  option2: ['bar', { option: true }],
});
