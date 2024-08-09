import path from 'node:path';
import fs from 'node:fs';
import { expect, Page } from '@playwright/test';
import { DataTable } from 'playwright-bdd';
import { Given, When, Then, Step } from './fixtures';
import { expectTypeOf } from 'expect-type';

Given('State {int}', async () => {
  // noop
});

Given('Set context prop {string} = {string}', async function ({ ctx }, key: string, value: string) {
  ctx[key] = value;
  // @ts-expect-error 'this' is any in pw-style steps
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
    expect(table.hashes()[row][col]).toEqual(value);
  },
);

Then('Doubled {int} equals {int}', async ({}, arg: number, doubled: number) => {
  expect(arg * 2).toEqual(doubled);
});

Then('Uppercase {string} equals {string}', async ({}, s1: string, s2: string) => {
  expect(s1.toUpperCase()).toEqual(s2);
});

Then('File {string} contains', async ({ $test }, fileName: string, table: DataTable) => {
  const filePath = path.join(path.dirname($test.info().file), fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  table.rows().forEach((row) => expect(content).toContain(row[0]));
});

Then('File {string} does not exist', async ({ $test }, fileName: string) => {
  const filePath = path.join(path.dirname($test.info().file), fileName);
  expect(fs.existsSync(filePath)).toEqual(false);
});

Then(
  'Context prop {string} to equal {string}',
  async function ({ ctx }, key: string, value: string) {
    expect(String(ctx[key])).toEqual(value);
    // @ts-expect-error 'this' is any in pw-style steps
    expect(String(this[key])).toEqual(value);
  },
);

Step('Tags are {string}', async ({ $tags, tagsFromCustomFixture }, tags: string) => {
  expect($tags.join(' ')).toEqual(tags);
  expect(tagsFromCustomFixture.join(' ')).toEqual(tags);
});

Then(
  'This step is not used, defined for checking types',
  async ({ page, $tags, tagsFromCustomFixture }) => {
    expectTypeOf(page).toEqualTypeOf<Page>();
    expectTypeOf($tags).toEqualTypeOf<string[]>();
    expectTypeOf(tagsFromCustomFixture).toEqualTypeOf<string[]>();
  },
);
