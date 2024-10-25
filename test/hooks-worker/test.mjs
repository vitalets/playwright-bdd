import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (run all tests)`, () => {
  const stdout = execPlaywrightTest(testDir.name);

  expect(countOfSubstring(stdout, 'BeforeAll 1 worker 0')).toEqual(1);
  expect(countOfSubstring(stdout, 'BeforeAll 2 worker 0')).toEqual(1);
  expect(countOfSubstring(stdout, 'AfterAll 1 worker 0')).toEqual(1);
  expect(countOfSubstring(stdout, 'AfterAll 2 worker 0')).toEqual(1);
});

function countOfSubstring(str, substr) {
  return str.split(substr).length - 1;
}
