import { expect } from '@playwright/test';
import { test } from '../../src';

test.beforeEach(async () => {
  process.env.CUCUMBER_CONFIG = JSON.stringify({
    require: ['test/custom-world/steps.ts'],
    worldParameters: { myParam: 'myValue' },
  });
});

test('Custom world contains fixtures and parameters', async ({ Then }) => {
  const world = await Then('Get world');
  expect(world.page).toBeDefined();
  expect(world.context).toBeDefined();
  expect(world.browser).toBeDefined();
  expect(world.browserName).toEqual('chromium');
  expect(world.request).toBeDefined();
  expect(world.testInfo).toBeDefined();
  expect(world.myBrowserName).toEqual('chromium');
  expect(world.propFromInit).toEqual('valueFromInit');
  expect(world.parameters).toEqual({ myParam: 'myValue' });
});
