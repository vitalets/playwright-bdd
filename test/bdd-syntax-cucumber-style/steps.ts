import path from 'node:path';
import fs from 'node:fs';
import { expect } from '@playwright/test';
import { Given, When, Then, DataTable, defineParameterType } from '@cucumber/cucumber';
import { BddWorld } from 'playwright-bdd';

Given('State {int}', async function () {
  // noop
});

Given<BddWorld & Record<string, string>>(
  'Set context prop {string} = {string}',
  async function (key: string, value: string) {
    this[key] = value;
  },
);

When('Action {int}', async function () {
  // noop
});

Then(/^Check (\d+)$/, async function (n: number) {
  expect(typeof n).toEqual('number');
});

Then<BddWorld>('Passed string arg {string} to equal "foo"', async function (arg: string) {
  expect(arg).toEqual('foo');
});

Then<BddWorld>('Passed int arg {int} to equal 42', async function (arg: number) {
  expect(arg).toEqual(42);
});

type Color = 'red' | 'blue' | 'yellow';
defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => s.toLowerCase() as Color,
});

Then<BddWorld>('Passed custom type arg {color} to equal "red"', function (color: Color) {
  expect(color).toEqual('red');
});

Then<BddWorld>(
  'Passed doc string to contain {string}',
  async function (arg: string, docString: string) {
    expect(docString).toContain(arg);
  },
);

Then<BddWorld>(
  'Passed data table to have in row {int} col {string} value {string}',
  async function (row: number, col: string, value: string, table: DataTable) {
    expect(table.hashes()[row][col]).toEqual(value);
  },
);

Then<BddWorld>('Doubled {int} equals {int}', async function (arg: number, doubled: number) {
  expect(arg * 2).toEqual(doubled);
});

Then<BddWorld>('Uppercase {string} equals {string}', async function (s1: string, s2: string) {
  expect(s1.toUpperCase()).toEqual(s2);
});

Then<BddWorld>('File {string} contains', async function (fileName: string, table: DataTable) {
  const filePath = path.join(path.dirname(this.test.info().file), fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  table.rows().forEach((row) => {
    expect(content).toContain(row[0]);
  });
});

Then<BddWorld & Record<string, string>>(
  'Context prop {string} to equal {string}',
  async function (key: string, value: string) {
    expect(String(this[key])).toEqual(value);
  },
);

Then<BddWorld>('Tags are {string}', async function (tags: string) {
  expect(this.tags.join(' ')).toEqual(tags);
});
