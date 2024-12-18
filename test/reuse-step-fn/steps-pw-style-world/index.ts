import { createBdd, DataTable } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { expectTypeOf } from 'expect-type';

const { When, Then } = createBdd();

const createTodo = When('I create todo {string}', async function ({ $testInfo }, text: string) {
  this.todos = this.todos || [];
  this.todos.push(`${$testInfo.title} - ${text}`);
});

expectTypeOf(createTodo).toBeFunction();
expectTypeOf(createTodo).parameter(0).toHaveProperty('$testInfo');
expectTypeOf(createTodo).parameter(1).toEqualTypeOf<string>();

When(
  'I create 2 todos {string} and {string}',
  async function ({ $testInfo }, text1: string, text2: string) {
    await createTodo.call(this, { $testInfo }, text1);
    await createTodo.call(this, { $testInfo }, text2);
  },
);

Then('I see todos:', async function ({}, data: DataTable) {
  expect(this.todos).toEqual(data.rows().flat());
});

When(
  'I incorrectly create 2 todos {string} and {string}',
  async function ({}, text1: string, _text2: string) {
    // incorrect invocation, should pass $testInfo
    await createTodo.call(this, {}, text1);
  },
);

// step without parameters - check typing

const fn = When('a step', async function () {});

expectTypeOf(fn).parameters.toEqualTypeOf<[]>();

Then('another step', async function () {
  fn.call(this);
});
