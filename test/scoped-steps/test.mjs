import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name);

  expect(stdout).toContain('scenario foo: step without tags');
  expect(stdout).toContain('scenario foo: step for @foo');

  expect(stdout).toContain('scenario bar: step without tags');
  expect(stdout).toContain('scenario bar: step for @bar');

  expect(stdout).toContain('scenario baz1: step without tags');
  expect(stdout).toContain('scenario baz1: step for @baz1');

  expect(stdout).toContain('scenario baz2: step without tags');
  expect(stdout).toContain('scenario baz2: step for @baz2');
});
