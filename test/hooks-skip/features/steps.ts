/* eslint-disable @typescript-eslint/no-unused-vars */
import { BeforeAll, AfterAll, Before, After, Given } from './fixtures';

BeforeAll(async ({ log, workerFixtureCommon }) => {
  log(`BeforeAll 1`);
});

BeforeAll({ tags: '@scenario1' }, async ({ log, workerFixture1 }) => {
  log(`BeforeAll 2 (@scenario1)`);
});

Before(async ({ log, testFixtureCommon }) => {
  log(`Before 1`);
});

Before({ tags: '@scenario1' }, async ({ log, testFixture1 }) => {
  log(`Before 2 (@scenario1)`);
});

AfterAll(async ({ log, workerFixtureCommon }) => {
  log(`AfterAll 1`);
});

AfterAll({ tags: '@scenario1' }, async ({ log, workerFixture1 }) => {
  log(`AfterAll 2 (@scenario1)`);
});

After(async ({ log }) => {
  log(`After 1`);
});

After({ tags: '@scenario1' }, async ({ log, testFixture1 }) => {
  log(`After 2 (@scenario1)`);
});

Given('a step', async ({ log, $testInfo }) => {
  log(`a step of ${$testInfo.title}`);
});
