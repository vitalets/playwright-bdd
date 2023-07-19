import { expect } from '@playwright/test';
import { createBdd } from '../../dist';
import { test } from './fixtures';

const { Then } = createBdd(test);

Then('visible todos count is {int}', async ({ todoPage }, count: number) => {
  await expect(todoPage.todoItems).toHaveCount(count);
});
