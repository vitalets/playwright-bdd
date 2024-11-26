/* eslint-disable @typescript-eslint/no-unused-vars */
import { BeforeWorker, AfterWorker, BeforeScenario, AfterScenario, Given } from './fixtures';

BeforeWorker(async ({ log, workerFixtureCommon }) => {
  log(`BeforeAll 1`);
});

BeforeWorker({ tags: '@scenario1' }, async ({ log, workerFixture1 }) => {
  log(`BeforeAll 2 (@scenario1)`);
});

BeforeScenario(async ({ log, testFixtureCommon }) => {
  log(`Before 1`);
});

BeforeScenario({ tags: '@scenario1' }, async ({ log, testFixture1 }) => {
  log(`Before 2 (@scenario1)`);
});

AfterWorker(async ({ log, workerFixtureCommon }) => {
  log(`AfterAll 1`);
});

AfterWorker({ tags: '@scenario1' }, async ({ log, workerFixture1 }) => {
  log(`AfterAll 2 (@scenario1)`);
});

AfterScenario(async ({ log }) => {
  log(`After 1`);
});

AfterScenario({ tags: '@scenario1' }, async ({ log, testFixture1 }) => {
  log(`After 2 (@scenario1)`);
});

Given('a step', async ({ log, $testInfo }) => {
  log(`a step of ${$testInfo.title}`);
});
