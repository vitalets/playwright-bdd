import { expect } from '@playwright/test';
import { test } from '../../src';

// eslint-disable-next-line no-empty-pattern
test.beforeEach(async ({}, testInfo) => {
  const cucumberConfig = /custom world/i.test(testInfo.title)
    ? {
        require: ['test/run/custom-world.steps.ts'],
        worldParameters: { myParam: 'myValue' },
      }
    : {
        require: ['test/run/default-world.steps.ts'],
      };
  process.env.CUCUMBER_CONFIG = JSON.stringify(cucumberConfig);
});

test('Default world contains fixtures and args', async ({ Then }) => {
  const { world, arg1, arg2 } = await Then('Get world and args "foo" and 42');
  expect(world.page).toBeDefined();
  expect(world.context).toBeDefined();
  expect(world.browser).toBeDefined();
  expect(world.browserName).toEqual('chromium');
  expect(world.request).toBeDefined();
  expect(world.testInfo).toBeDefined();
  expect(arg1).toEqual('foo');
  expect(arg2).toEqual(42);
});

test('Custom world contains fixtures, args and parameters', async ({
  Then,
}) => {
  const { world, arg1, arg2 } = await Then('Get world and args "foo" and 42');
  expect(world.page).toBeDefined();
  expect(world.context).toBeDefined();
  expect(world.browser).toBeDefined();
  expect(world.browserName).toEqual('chromium');
  expect(world.request).toBeDefined();
  expect(world.testInfo).toBeDefined();
  expect(arg1).toEqual('foo');
  expect(arg2).toEqual(42);
  expect(world.parameters.myParam).toEqual('myValue');
  expect(world.myBrowserName).toEqual('chromium');
  expect(world.propFromInit).toEqual('valueFromInit');
});
