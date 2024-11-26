import { test, expectCalls, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 1 } });
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
