import { test, expectCalls, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// These tests mainly focus on worker hooks order across several workers.
// Checking of scenario hooks order is in tests/hooks-order-one-feature.

test(`${testDir.name} (1 worker)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 1 } });

  expectCalls('worker 0: ', stdout, [
    'workerFixtureCommon setup',
    'workerFixture1 setup',
    'BeforeAll 1',
    'BeforeAll 2',
    'BeforeAll 3 (@feature1)',
    'a step of scenario 1',
    'workerFixture2 setup',
    'BeforeAll 4 (not @feature1)',
    'a step of scenario 2',
    // all afterAll hooks run in worker teardown,
    // not instantly after the corresponding test file
    'AfterAll 4 (not @feature1)',
    'AfterAll 3 (@feature1)',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

test(`${testDir.name} (2 workers)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 2 } });

  expectCalls('worker 0: ', stdout, [
    'workerFixtureCommon setup',
    'workerFixture1 setup',
    'BeforeAll 1',
    'BeforeAll 2',
    'BeforeAll 3 (@feature1)',
    'a step of scenario 1',
    'AfterAll 3 (@feature1)',
    'AfterAll 2',
    'AfterAll 1',
  ]);

  expectCalls('worker 1: ', stdout, [
    'workerFixtureCommon setup',
    'workerFixture2 setup',
    'BeforeAll 1',
    'BeforeAll 2',
    'BeforeAll 4 (not @feature1)',
    'a step of scenario 2',
    'AfterAll 4 (not @feature1)',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});
