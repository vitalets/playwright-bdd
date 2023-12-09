import { test as base } from 'playwright-bdd';

export const test = base.extend<{ option: string }>({
  option: ['foo', { option: true }],
});
