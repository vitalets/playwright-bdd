import { test as base } from '../fixtures.js';

export const test = base.extend<{ secondOption: string }>({
  secondOption: ['bar', { option: true }],
});
