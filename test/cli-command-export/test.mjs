import { expect } from '@playwright/test';
import { test, TestDir, normalize, execPlaywrightTest, BDDGEN_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (all steps)`, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} export`);
  expect(stdout).toContain('Using config: playwright.config.ts');
  expect(stdout).toContain('List of all steps (6):');

  expect(stdout).toContain('* Given I am on todo page');
  expect(stdout).toContain('* When I add todo {string}');
  expect(stdout).toContain('* Then visible todos count is (\\d+)');
  expect(stdout).toContain('* When some step');
  expect(stdout).toContain('* Given I am on another todo page');
  expect(stdout).toContain('* Given TodoPage: step');
});

test(`${testDir.name} (unused steps)`, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} export --unused-steps`);
  expect(stdout).toContain('Using config: playwright.config.ts');
  expect(stdout).toContain(`Unused steps (5):`);

  expect(stdout).toContain('When I add todo {string}'); // twice
  expect(stdout).toContain('When some step');
  expect(stdout).toContain('Given I am on another todo page');
  expect(stdout).toContain('Given TodoPage: step');

  // locations
  expect(stdout).toContain(normalize('steps/steps.ts:9'));
  expect(stdout).toContain(normalize('steps/steps.ts:17'));
  expect(stdout).toContain(normalize('steps/steps2.ts:5'));
  expect(stdout).toContain(normalize('steps/steps2.ts:10'));
  expect(stdout).toContain(normalize('steps/TodoPage.ts:7'));
});
