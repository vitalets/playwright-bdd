import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('error in anonymous before hook', async ({ scenario }) => {
  await expect(
    scenario.getSteps().filter({
      hasText: `Hook "BeforeEach hook" failed: ${normalize('features/before-hook/steps.ts')}:`,
    }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'GivenAction 1' })).toHaveCount(1);
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-before-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in named before hook', async ({ scenario }) => {
  await expect(
    scenario.getSteps().filter({
      hasText: `Hook "failing named before hook" failed: ${normalize('features/before-hook/steps.ts')}:`,
    }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'GivenAction 1' })).toHaveCount(1);
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-before-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in nested step in before hook', async ({ scenario }) => {
  await expect(
    scenario
      .getSteps()
      .filter({ hasText: `Hook "my step" failed: ${normalize('features/before-hook/steps.ts')}:` }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'GivenAction 1' })).toHaveCount(1);
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in fixture setup (no step)', async ({ scenario }) => {
  await expect(
    scenario.getSteps().filter({ hasText: /Hook ".*fixtureWithErrorInSetup.*" failed:/ }),
  ).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({ hasText: 'Givenstep that uses fixtureWithErrorInSetup' }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'WhenAction 1' })).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'screenshot' })).toHaveCount(1);
  await expect(scenario.getSteps()).toContainText([normalize('features/before-hook/fixtures.ts')]);
  await expect(scenario.getAttachments()).toContainText([
    'my attachment|outside step',
    'my attachment|in step',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getErrors()).toContainText(['error in fixture setup']);
});

test('error in fixture setup (with step)', async ({ scenario }) => {
  await expect(
    scenario.getSteps().filter({
      hasText: `Hook "step inside fixture" failed: ${normalize('features/before-hook/fixtures.ts')}:`,
    }),
  ).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({ hasText: 'Givenstep that uses fixtureWithErrorInSetupStep' }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'WhenAction 2' })).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'screenshot' })).toHaveCount(1);
  await expect(scenario.getAttachments()).toContainText([
    'my attachment|in step',
    'my attachment|outside step',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getErrors()).toContainText(['error in fixture setup']);
});
