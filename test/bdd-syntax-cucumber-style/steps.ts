import path from 'node:path';
import fs from 'node:fs';
import { expect } from '@playwright/test';
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { World } from '../../dist';

Given('State {int}', async function () {
  // noop
});

Given(
  'Set context prop {string} = {string}',
  async function (this: World & Record<string, string>, key: string, value: string) {
    this[key] = value;
  },
);

When('Action {int}', async function () {
  // noop
});

Then(/^Check (\d+)$/, async function (n: number) {
  expect(typeof n).toEqual('number');
});

Then('Passed string arg {string} to equal "foo"', async function (this: World, arg: string) {
  expect(arg).toEqual('foo');
});

Then('Passed int arg {int} to equal 42', async function (this: World, arg: number) {
  expect(arg).toEqual(42);
});

Then(
  'Passed doc string to contain {string}',
  async function (this: World, arg: string, docString: string) {
    expect(docString).toContain(arg);
  },
);

Then(
  'Passed data table to have in row {int} col {string} value {string}',
  async function (this: World, row: number, col: string, value: string, table: DataTable) {
    expect(table.hashes()[row][col]).toEqual(value);
  },
);

Then('Doubled {int} equals {int}', async function (this: World, arg: number, doubled: number) {
  expect(arg * 2).toEqual(doubled);
});

Then('Uppercase {string} equals {string}', async function (this: World, s1: string, s2: string) {
  expect(s1.toUpperCase()).toEqual(s2);
});

Then('File {string} contains', async function (this: World, fileName: string, table: DataTable) {
  const filePath = path.join(path.dirname(this.testInfo.file), fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  table.rows().forEach((row) => expect(content).toContain(row[0]));
});

Then(
  'Context prop {string} to equal {string}',
  async function (this: World & Record<string, string>, key: string, value: string) {
    expect(String(this[key])).toEqual(value);
  },
);

Then('Tags are {string}', async function (this: World, tags: string) {
  expect(this.tags.join(' ')).toEqual(tags);
});
