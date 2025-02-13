import { test, expectCalls, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (1 worker)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 1 } });
  expectCalls('worker 0: ', stdout, [
    // scenario 1
    'BeforeAll 1',
    'testFixtureCommon setup',
    'testFixtureScenario1 setup',
    'Before 1',
    'Before 2',
    'Before 3 (@scenario1)',
    'BeforeStep 1',
    'BeforeStep 2',
    'BeforeStep 3 (@scenario1)',
    'bg step of scenario 1',
    'AfterStep 3 (@scenario1)',
    'AfterStep 2',
    'AfterStep 1',
    'BeforeStep 1',
    'BeforeStep 2',
    'BeforeStep 3 (@scenario1)',
    'a step of scenario 1',
    'AfterStep 3 (@scenario1)',
    'AfterStep 2',
    'AfterStep 1',
    'After 3 (@scenario1)',
    'After 2',
    'After 1',
    // scenario 2
    'testFixtureCommon setup',
    // Currently testFixtureScenario1 is executed for scenario 2 as well,
    // b/c we have all scenario hooks fixtures in a single object ($beforeEachFixtures, )
    // todo: setup only needed fixtures for each test
    'testFixtureScenario1 setup',
    'Before 1',
    'Before 2',
    'BeforeStep 1',
    'BeforeStep 2',
    'bg step of scenario 2',
    'AfterStep 2',
    'AfterStep 1',
    'BeforeStep 1',
    'BeforeStep 2',
    'a step of scenario 2',
    'AfterStep 2',
    'AfterStep 1',
    'After 2',
    'After 1',
    'AfterAll 1',
  ]);
});

test(`${testDir.name} (2 workers, fully-parallel)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 2, FULLY_PARALLEL: 1 } });

  // worker 0
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'testFixtureCommon setup',
    'testFixtureScenario1 setup',
    'Before 1',
    'Before 2',
    'Before 3 (@scenario1)',
    'BeforeStep 1',
    'BeforeStep 2',
    'BeforeStep 3 (@scenario1)',
    'bg step of scenario 1',
    'AfterStep 3 (@scenario1)',
    'AfterStep 2',
    'AfterStep 1',
    'BeforeStep 1',
    'BeforeStep 2',
    'BeforeStep 3 (@scenario1)',
    'a step of scenario 1',
    'AfterStep 3 (@scenario1)',
    'AfterStep 2',
    'AfterStep 1',
    'After 3 (@scenario1)',
    'After 2',
    'After 1',
    'AfterAll 1',
  ]);

  // worker 1
  expectCalls('worker 1: ', stdout, [
    'BeforeAll 1',
    'testFixtureCommon setup',
    'testFixtureScenario1 setup',
    'Before 1',
    'Before 2',
    'BeforeStep 1',
    'BeforeStep 2',
    'bg step of scenario 2',
    'AfterStep 2',
    'AfterStep 1',
    'BeforeStep 1',
    'BeforeStep 2',
    'a step of scenario 2',
    'AfterStep 2',
    'AfterStep 1',
    'After 2',
    'After 1',
    'AfterAll 1',
  ]);
});
