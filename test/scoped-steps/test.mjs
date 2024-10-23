import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name);

  expect(stdout).toContain('running step for @foo: scenario for foo');
  expect(stdout).toContain('running step for @bar: scenario for bar');

  expect(stdout).toContain('running step for @baz1: scenario for baz 1');
  expect(stdout).toContain('running step for @baz2: scenario for baz 2');

  expect(stdout).toContain('running step without tags: scenario for foo');
  expect(stdout).toContain('running step without tags: scenario for bar');
  expect(stdout).toContain('running step without tags: scenario for baz 1');
  expect(stdout).toContain('running step without tags: scenario for baz 2');
});
