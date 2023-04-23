import { expect } from '@playwright/test';
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { World } from '../src';

Given('State {int}', async function () {
  // noop
});

When('Action {int}', async function () {
  // noop
});

Then('Check {int}', async function () {
  // noop
});

Given(
  'Set world prop {string} = {string}',
  async function (this: World & Record<string, string>, key: string, value: string) {
    this[key] = value;
  },
);

Then('Passed string arg {string} to equal "foo"', async function (this: World, arg: string) {
  expect(arg).toEqual('foo');
});

Then('Passed int arg {int} to equal 42', async function (this: World, arg: number) {
  expect(arg).toEqual(42);
});

Then('Passed doc string to contain {string}', async function (this: World, arg: string, docString: string) {
  expect(docString).toContain(arg);
});

Then(
  'Passed data table to have in row {int} col {string} value {string}',
  async function (this: World, row: number, col: string, value: string, table: DataTable) {
    expect(table.hashes()[row][col]).toEqual(value);
  },
);

Then(
  'World prop {string} to equal {string}',
  async function (this: World & Record<string, string>, key: string, value: string) {
    expect(String(this[key])).toEqual(value);
  },
);

Then('World prop {string} to be defined', async function (this: World, key: keyof World) {
  expect(this[key]).toBeDefined();
});

Then('Doubled {int} to equal {int}', async function (this: World, arg: number, doubled: number) {
  expect(arg * 2).toEqual(doubled);
});
