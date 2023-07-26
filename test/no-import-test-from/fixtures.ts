import { test as base } from '../../dist';

export const test = base.extend<{ option: string }>({
  option: ['foo', { option: true }],
});
