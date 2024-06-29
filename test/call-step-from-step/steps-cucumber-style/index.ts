import { createBdd, DataTable } from 'playwright-bdd';
import { test } from './fixtures';
import { expect } from '@playwright/test';

const { When, Then } = createBdd(test, { worldFixture: 'world' });

const createTodo = When('I create todo {string}', async function (text: string) {
  this.todos.push(`${this.testInfo.title} - ${text}`);
});

When('I create 2 todos {string} and {string}', async function (text1: string, text2: string) {
  await createTodo.call(this, text1);
  await createTodo.call(this, text2);
});

When(
  'I incorrectly create 2 todos {string} and {string}',
  async function (_text1: string, _text2: string) {
    // TS automatically blocks these invalid calls!
    // await createTodo(text1);
    // await createTodo.call({}, text2);
  },
);

Then('I see todos:', async function (data: DataTable) {
  expect(this.todos).toEqual(data.rows().flat());
});
