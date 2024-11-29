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
