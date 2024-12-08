import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, BeforeAll } = createBdd(test);

BeforeAll({ tags: '@failing-anonymous-before-all-hook' }, async () => {
  expect(true).toEqual(false);
});

BeforeAll({ name: 'my hook', tags: '@failing-named-before-all-hook' }, async () => {
  expect(true).toEqual(false);
});

Given('step that uses workerFixtureWithErrorInSetup', async ({ workerFixtureWithErrorInSetup }) => {
  return workerFixtureWithErrorInSetup;
});
