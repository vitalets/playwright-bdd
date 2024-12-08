import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, AfterAll } = createBdd(test);

AfterAll({ tags: '@failing-anonymous-after-all-hook' }, async () => {
  expect(true).toEqual(false);
});

AfterAll({ name: 'my hook', tags: '@failing-named-after-all-hook' }, async () => {
  expect(true).toEqual(false);
});

Given(
  'step that uses workerFixtureWithErrorInTeardown',
  async ({ workerFixtureWithErrorInTeardown }) => {
    return workerFixtureWithErrorInTeardown;
  },
);
