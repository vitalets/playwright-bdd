import { test as base } from '../../../dist';

export const test = base.extend<{ ctx: Record<string, string> }>({
  ctx: ({}, use) => use({}),
});
