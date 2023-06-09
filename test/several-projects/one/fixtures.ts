import { test as base } from '../../../dist/run/baseTest';

export const test = base.extend<{ option: string }>({
  option: ['foo', { option: true }],
});
