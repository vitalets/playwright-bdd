import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest, BDDGEN_CMD } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(t.name, `${BDDGEN_CMD} env`);
  expect(stdout).toContain('platform:');
  expect(stdout).toContain('playwright-bdd:');
  expect(stdout).toContain('@playwright/test: v1.');
  expect(stdout).toContain('Playwright config file: playwright.config.ts');
});
