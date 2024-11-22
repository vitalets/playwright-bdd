import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name);

  expect(stdout).toContain('scenario foo: step without tags');
  expect(stdout).toContain('scenario foo: step for @foo');

  expect(stdout).toContain('scenario bar: step without tags');
  expect(stdout).toContain('scenario bar: step for @bar');

  // fixtureBg2 is also executed for baz1 although it is not used in the test.
  // because it is used by bg step, where we statically prepare all fixtures
  expect(stdout).toContain('scenario baz1: fixtureBg1');
  expect(stdout).toContain('scenario baz1: fixtureBg2');
  expect(stdout).toContain('scenario baz1: bg step for @baz1');
  expect(stdout).toContain('scenario baz1: step without tags');
  expect(stdout).toContain('scenario baz1: step for @baz1');

  expect(stdout).toContain('scenario baz2: fixtureBg1');
  expect(stdout).toContain('scenario baz2: fixtureBg2');
  expect(stdout).toContain('scenario baz2: bg step for @baz2');
  expect(stdout).toContain('scenario baz2: step without tags');
  expect(stdout).toContain('scenario baz2: step for @baz2');
});
