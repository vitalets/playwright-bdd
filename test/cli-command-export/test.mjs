import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(t.name, 'node ../../dist/cli export');
  expect(stdout).toContain('List of all steps found by config: playwright.config.ts');
  expect(stdout).toContain('* Given I am on todo page');
  expect(stdout).toContain('* When I add todo {string}');
  expect(stdout).toContain('* Then visible todos count is (\\d+)');
  expect(stdout).toContain('* When some step');
  expect(stdout).toContain('* Given I am on another todo page');
});
