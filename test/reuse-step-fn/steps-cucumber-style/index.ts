import { createBdd, DataTable } from 'playwright-bdd';
import { test, World } from './fixtures';
import { expect } from '@playwright/test';
import { expectTypeOf } from 'expect-type';

const { When, Then } = createBdd(test, { worldFixture: 'world' });

const createTodo = When('I create todo {string}', async function (text: string) {
  this.todos.push(`${this.testInfo.title} - ${text}`);
});

expectTypeOf(createTodo).toBeFunction();
expectTypeOf(createTodo).thisParameter.toEqualTypeOf<World>();
expectTypeOf(createTodo).parameter(0).toEqualTypeOf<string>();

When('I create 2 todos {string} and {string}', async function (text1: string, text2: string) {
  await createTodo.call(this, text1);
  await createTodo.call(this, text2);
});

Then('I see todos:', async function (data: DataTable) {
  expect(this.todos).toEqual(data.rows().flat());
});

When(
  'I incorrectly create 2 todos {string} and {string}',
  async function (_text1: string, _text2: string) {
    // todo: incorrect invocation: forget to pass world
    // await createTodo(text1, text2);
  },
);

// step without parameters - check typing

const fn = When('a step', async () => {});

expectTypeOf(fn).parameters.toEqualTypeOf<[]>();

Then('another step', async () => {
  fn.call(this);
});
