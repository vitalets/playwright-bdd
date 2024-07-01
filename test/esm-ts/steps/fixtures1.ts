import { test as base } from 'playwright-bdd';

export default base.extend<{ someOption: string }>({
  someOption: ['foo', { option: true }],
});
