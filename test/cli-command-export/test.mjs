import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest, BDDGEN_CMD } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (all steps)`, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} export`);
  expect(stdout).toContain('Using config: playwright.config.ts');
  expect(stdout).toContain('List of all steps (5):');

  expect(stdout).toContain('* Given I am on todo page');
  expect(stdout).toContain('* When I add todo {string}');
  expect(stdout).toContain('* Then visible todos count is (\\d+)');
  expect(stdout).toContain('* When some step');
  expect(stdout).toContain('* Given I am on another todo page');
});

test(`${testDir.name} (unused steps)`, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} export --unused-steps`);
  expect(stdout).toContain('Using config: playwright.config.ts');
  expect(stdout).toContain(`List of unused steps (3):`);

  expect(stdout).toContain('* When I add todo {string}');
  expect(stdout).toContain('* When some step');
  expect(stdout).toContain('* Given I am on another todo page');
});
