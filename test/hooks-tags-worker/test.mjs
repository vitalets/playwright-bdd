import { test, expect, TestDir, execPlaywrightTest, countOfSubstring } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (1 worker)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 1 } });

  // feature 1
  expect(countOfSubstring(stdout, 'worker 0: BeforeAll 1')).toEqual(1);
  expect(countOfSubstring(stdout, 'worker 0: BeforeAll 2')).toEqual(1);
  expect(countOfSubstring(stdout, 'worker 0: BeforeAll for feature 1')).toEqual(1);
  expect(countOfSubstring(stdout, 'worker 0: BeforeAll for feature (1 or 2)')).toEqual(1);
  expect(countOfSubstring(stdout, 'worker 0: a step of scenario 1')).toEqual(1);
  // after all should be called after feature 2 !!!
  expect(countOfSubstring(stdout, 'worker 0: AfterAll 2')).toEqual(1);
  expect(countOfSubstring(stdout, 'worker 0: AfterAll 1')).toEqual(1);

  // feature 2
  expect(countOfSubstring(stdout, 'worker 0: BeforeAll for feature 2')).toEqual(1);
  expect(countOfSubstring(stdout, 'worker 0: a step of scenario 2')).toEqual(1);
});
