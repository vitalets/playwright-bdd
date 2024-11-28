import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name);

  expect(stdout).toContain('scenario for TodoPage: todoPage - decorator step');
  expect(stdout).toContain('scenario for TodoPage2: todoPage2 - decorator step');
  expect(stdout).toContain('scenario for TodoPage3: todoPage3 - decorator step');
  expect(stdout).toContain('scenario for TodoPage4: todoPage4 - decorator step from base');
  expect(stdout).toContain('scenario for TodoPage4: todoPage4 - unique step');
});
