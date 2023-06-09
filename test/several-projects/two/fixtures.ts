import { test as base } from '../one/fixtures';

export const test = base.extend<{ secondOption: string }>({
  secondOption: ['bar', { option: true }],
});
