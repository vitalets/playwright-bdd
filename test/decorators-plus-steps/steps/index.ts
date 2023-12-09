import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Then } = createBdd(test);

Then('Regular step using TodoPage', async ({ todoPage }) => {
  expect(todoPage).toBeDefined();
});

Then('Regular step using AdminTodoPage', async ({ adminTodoPage }) => {
  expect(adminTodoPage).toBeDefined();
});
