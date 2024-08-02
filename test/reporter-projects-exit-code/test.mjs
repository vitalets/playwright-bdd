import { test, TestDir, expect, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// See: https://github.com/vitalets/playwright-bdd/issues/200
test(testDir.name, async () => {
  const stdout = execPlaywrightTestWithError(testDir.name);
  expect(stdout).toContain('failing auth');
});
