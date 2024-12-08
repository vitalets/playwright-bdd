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

AfterAll({ tags: '@after-all-hook-with-timeout' }, async ({ $workerInfo }) => {
  await new Promise((r) => setTimeout(r, $workerInfo.project.timeout + 100));
});

Given(
  'step that uses workerFixtureWithErrorInTeardown',
  async ({ workerFixtureWithErrorInTeardown }) => {
    return workerFixtureWithErrorInTeardown;
  },
);
