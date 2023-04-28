import { expect } from '@playwright/test';
// import { test } from '../../src';
import { createTest } from './internal';

const test = createTest({
  todoPage: ({ page }, ...args) => useFixture('todoPage', { page }, ...args),
  account: ({ page }, ...args) => useFixture('todoPage', { page }, ...args),
});
// test.use({ todoPage: ({ page }, ...args) => useFixture('todoPage', { page }, ...args) });
// const test = base.extend({ todoPage: ({ page }) => myUse('todoPage') });

test.beforeEach(async () => {
  process.env.CUCUMBER_CONFIG = JSON.stringify({
    paths: ['test/custom-fixtures/*.feature'],
    require: ['test/custom-fixtures/steps.ts'],
  });
});

test('Custom world contains fixtures and parameters', async ({ Then, todoPage, account }) => {
  const res = await Then('Get custom fixtures and arg "foo"', null, { todoPage, account });
  expect(res.page).toBeDefined();
  expect(res.myFixture).toBeDefined();
  expect(res.arg).toEqual('foo');
});
