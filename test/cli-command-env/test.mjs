import { test, TestDir, execPlaywrightTest, BDDGEN_CMD, expect } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} env`);
  expect(stdout).toContain('platform:');
  expect(stdout).toContain(`node: ${process.version}`);
  expect(stdout).toContain('playwright-bdd: v');
  expect(stdout).toContain('@playwright/test: v1.');
  expect(stdout).toContain('Playwright config file: playwright.config.ts');
});

test(`${testDir.name} (no playwright config)`, () => {
  // run in 'features' dir to miss playwright.config.ts
  const cmd = `${BDDGEN_CMD} env`.replace('../node_modules', '../../node_modules');
  const stdout = execPlaywrightTest(`${testDir.name}/features`, cmd);

  expect(stdout).toContain('Playwright config file: none');
});
