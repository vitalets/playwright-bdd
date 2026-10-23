import { test, expect, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (all styles and hook interactions)`, () => {
  const stdout = execPlaywrightTestWithError(testDir.name, 'Step timeout of 50ms exceeded.');
  expect(stdout).toContain('6 failed');
  expect(stdout).toContain('1 passed');
  expect(stdout).toContain('beforeStep hook timeout (10 ms)');
  expect(stdout.match(/TimeoutError: Step timeout of 50ms exceeded\./g)).toHaveLength(5);
});
