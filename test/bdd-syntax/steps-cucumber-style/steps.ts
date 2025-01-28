import { expect } from '@playwright/test';
import { DataTable, defineParameterType } from 'playwright-bdd';
import { Given, When, Then } from './fixtures';
import { expectTypeOf } from 'expect-type';
import { World } from './world';

Given('State {int}', async function () {
  expectTypeOf(this).toEqualTypeOf<World>();
  // noop
});

Given('Set context prop {string} = {string}', async function (key: string, value: string) {
  this[key] = value;
});

When('Action {int}', async function () {
  // noop
});

Then(/^Check (\d+)$/, async function (n: number) {
  expect(typeof n).toEqual('number');
});

Then('Passed string arg {string} to equal "foo"', async function (arg: string) {
  expect(arg).toEqual('foo');
});

Then('Passed int arg {int} to equal 42', async function (arg: number) {
  expect(arg).toEqual(42);
});

type Color = 'red' | 'blue' | 'yellow';
defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => s.toLowerCase() as Color,
});

Then('Passed custom type arg {color} to equal "red"', function (color: Color) {
  expect(color).toEqual('red');
});

Then('Passed doc string to contain {string}', async function (arg: string, docString: string) {
  expect(docString).toContain(arg);
});

Then(
  'Passed data table to have in row {int} col {string} value {string}',
  async function (row: number, col: string, value: string, table: DataTable) {
    expect(table.hashes()[row]?.[col]).toEqual(value);
  },
);

Then('Doubled {int} equals {int}', async function (arg: number, doubled: number) {
  expect(arg * 2).toEqual(doubled);
});

Then('Uppercase {string} equals {string}', async function (s1: string, s2: string) {
  expect(s1.toUpperCase()).toEqual(s2);
});

Then('Context prop {string} to equal {string}', async function (key: string, value: string) {
  expect(String(this[key])).toEqual(value);
});

Then('Tags are {string}', async function (tags: string) {
  expect(this.tags.join(' ')).toEqual(tags);
});
