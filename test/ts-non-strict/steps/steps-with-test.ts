import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { When } = createBdd(test);

When('I create todo', async ({ myFixture }) => {
  expect(myFixture.foo).toEqual(42);
});
