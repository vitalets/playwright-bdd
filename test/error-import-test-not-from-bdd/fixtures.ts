import { test as base } from '@playwright/test';

export const test = base.extend<{ option: string }>({
  option: ['foo', { option: true }],
});
