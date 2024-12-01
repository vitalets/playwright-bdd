import { test, expectCalls, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 1 } });

  // skipped hooks: BeforeAll 2, Before 2, AfterAll 2, After 2
  expectCalls('worker 0: ', stdout, [
    'workerFixtureCommon setup',
    'BeforeAll 1',
    'testFixtureCommon setup',
    'Before 1',
    'a step of scenario 2',
    'After 1',
    'AfterAll 1',
  ]);
});
