import { test as base } from 'playwright-bdd';

export default base.extend<{ option1: string }>({
  option1: ['foo', { option: true }],
});
