import { DataTable } from '@cucumber/cucumber';
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

test('doc string', async ({ Then }) => {
  const text = await Then('Get doc string', {
    docString: { content: 'Some Title' },
  });
  expect(text).toEqual('Some Title');
});

test('data table', async ({ Then }) => {
  const dataTable = {
    dataTable: {
      rows: [
        {
          cells: [{ value: 'name' }, { value: 'email' }, { value: 'twitter' }],
        },
        {
          cells: [
            { value: 'Aslak' },
            { value: 'aslak@cucumber.io' },
            { value: '@aslak_hellesoy' },
          ],
        },
        {
          cells: [
            { value: 'Julien' },
            { value: 'julien@cucumber.io' },
            { value: '@jbpros' },
          ],
        },
      ],
    },
  };
  const table: DataTable = await Then('Get data table', dataTable);
  expect(table.hashes()).toEqual([
    { name: 'Aslak', email: 'aslak@cucumber.io', twitter: '@aslak_hellesoy' },
    { name: 'Julien', email: 'julien@cucumber.io', twitter: '@jbpros' },
  ]);
  expect(table.rows()).toEqual([
    ['Aslak', 'aslak@cucumber.io', '@aslak_hellesoy'],
    ['Julien', 'julien@cucumber.io', '@jbpros'],
  ]);
});
