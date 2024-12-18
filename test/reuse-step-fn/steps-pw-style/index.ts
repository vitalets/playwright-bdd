import { createBdd, DataTable } from 'playwright-bdd';
import { test } from './fixtures';
import { expect } from '@playwright/test';
import { expectTypeOf } from 'expect-type';

const { When, Then } = createBdd(test);

const createTodo = When('I create todo {string}', async ({ todos, $testInfo }, text: string) => {
  todos.push(`${$testInfo.title} - ${text}`);
});

expectTypeOf(createTodo).toBeFunction();
expectTypeOf(createTodo).parameter(0).toHaveProperty('$testInfo');
expectTypeOf(createTodo).parameter(0).toHaveProperty('todos');
expectTypeOf(createTodo).parameter(1).toEqualTypeOf<string>();

When(
  'I create 2 todos {string} and {string}',
  async ({ todos, $testInfo }, text1: string, text2: string) => {
    await createTodo({ todos, $testInfo }, text1);
    await createTodo({ todos, $testInfo }, text2);
  },
);

When(
  'I incorrectly create 2 todos {string} and {string}',
  async ({ todos, $testInfo }, text1: string, text2: string) => {
    await createTodo({}, text1);
    await createTodo({ todos, $testInfo }, text2);
  },
);

Then('I see todos:', async ({ todos }, data: DataTable) => {
  expect(todos).toEqual(data.rows().flat());
});

// step without parameters - check typing

const fn = When('a step', async () => {});

// expectTypeOf(fn).parameters.toEqualTypeOf<[]>();

Then('another step', async () => {
  fn();
});
