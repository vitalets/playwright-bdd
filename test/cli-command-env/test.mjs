import { test, TestDir, execPlaywrightTest, BDDGEN_CMD, expect } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} env`);
  expect(stdout).toContain('platform:');
  expect(stdout).toContain('playwright-bdd:');
  expect(stdout).toContain('@playwright/test: v1.');
  expect(stdout).toContain('Playwright config file: playwright.config.ts');
});
