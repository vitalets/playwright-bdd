import { expect } from '@playwright/test';
import { createBdd } from '../../dist';
import { test } from './fixtures';

const { Then } = createBdd(test);

Then('visible todos count is {int}', async ({ todoPage }, count: number) => {
  expect(todoPage.todos).toHaveLength(count);
});
