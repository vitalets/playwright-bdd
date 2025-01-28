import { expect, Page } from '@playwright/test';
import { DataTable } from 'playwright-bdd';
import { Given, When, Then, Step } from './fixtures';
import { expectTypeOf } from 'expect-type';

Given('State {int}', async () => {
  // noop
});

Given('Set context prop {string} = {string}', async function ({ ctx }, key: string, value: string) {
  ctx[key] = value;
  this[key] = value;
});

When('Action {int}', () => {
  // noop
});

Then(/^Check (\d+)$/, async ({}, n: number) => {
  expect(typeof n).toEqual('number');
});

Then('Passed string arg {string} to equal "foo"', async ({}, arg: string) => {
  expect(arg).toEqual('foo');
});

Then('Passed int arg {int} to equal 42', ({}, arg: number) => {
  expect(arg).toEqual(42);
});

Then('Passed custom type arg {color} to equal "red"', ({}, color: string) => {
  expect(color).toEqual('red');
});

Then('Passed doc string to contain {string}', async ({}, arg: string, docString: string) => {
  expect(docString).toContain(arg);
});

Then(
  'Passed data table to have in row {int} col {string} value {string}',
  async ({}, row: number, col: string, value: string, table: DataTable) => {
    expect(table.hashes()[row]?.[col]).toEqual(value);
  },
);

Then('Doubled {int} equals {int}', async ({}, arg: number, doubled: number) => {
  expect(arg * 2).toEqual(doubled);
});

Then('Uppercase {string} equals {string}', async ({}, s1: string, s2: string) => {
  expect(s1.toUpperCase()).toEqual(s2);
});

Then(
  'Context prop {string} to equal {string}',
  async function ({ ctx }, key: string, value: string) {
    expect(String(ctx[key])).toEqual(value);
    expect(String(this[key])).toEqual(value);
  },
);

Step('Tags are {string}', async ({ $tags, tagsFromCustomFixture }, tags: string) => {
  expect($tags.join(' ')).toEqual(tags);
  expect(tagsFromCustomFixture.join(' ')).toEqual(tags);
});

// don't use this step b/c it creates page
Then(
  'This step is not used, defined for checking types',
  async function ({ page, $tags, tagsFromCustomFixture }) {
    expectTypeOf(page).toEqualTypeOf<Page>();
    expectTypeOf($tags).toEqualTypeOf<string[]>();
    expectTypeOf(tagsFromCustomFixture).toEqualTypeOf<string[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectTypeOf(this).toEqualTypeOf<Record<string, any>>();
  },
);
