import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('error in anonymous after hook', async ({ scenario }) => {
  await expect(scenario.getSteps().filter({ hasText: 'Givenstep with page' })).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({
      hasText: `Hook "AfterEach hook" failed: ${normalize('features/after-hook/steps.ts')}:`,
    }),
  ).toHaveCount(1);
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-after-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in named after hook', async ({ scenario }) => {
  await expect(scenario.getSteps().filter({ hasText: 'Givenstep with page' })).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({
      hasText: `Hook "failing named after hook" failed: ${normalize('features/after-hook/steps.ts')}:`,
    }),
  ).toHaveCount(1);
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-after-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in nested step in after hook', async ({ scenario }) => {
  await expect(scenario.getSteps().filter({ hasText: 'Givenstep with page' })).toHaveCount(1);
  await expect(
    scenario
      .getSteps()
      .filter({ hasText: `Hook "my step" failed: ${normalize('features/after-hook/steps.ts')}:` }),
  ).toHaveCount(1);
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in fixture teardown (no step)', async ({ scenario }) => {
  await expect(scenario.getSteps().filter({ hasText: 'my attachment|before use' })).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'Givenstep with page' })).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({ hasText: 'Givenstep that uses fixtureWithErrorInTeardown' }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'WhenAction 1' })).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({ hasText: /Hook ".*fixtureWithErrorInTeardown.*" failed:/ }),
  ).toHaveCount(1);
  await expect(scenario.getSteps()).toContainText([normalize('features/after-hook/fixtures.ts')]);
  await expect(scenario.getSteps()).toContainText(['screenshot']);
  await expect(scenario.getAttachments()).toContainText([
    'my attachment|before use', // prettier-ignore
    'my attachment|after use',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['error in fixture teardown']);
});

test('error in fixture teardown (with step)', async ({ scenario }) => {
  await expect(
    scenario.getSteps().filter({ hasText: 'my attachment|outside step (before use)' }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'Givenstep with page' })).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({ hasText: 'Givenstep that uses fixtureWithErrorInTeardownStep' }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'WhenAction 1' })).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({
      hasText: `Hook "step inside fixture" failed: ${normalize('features/after-hook/fixtures.ts')}:`,
    }),
  ).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({ hasText: 'my attachment|outside step (after use)' }),
  ).toHaveCount(1);
  await expect(scenario.getSteps()).toContainText(['screenshot']);
  await expect(scenario.getAttachments()).toContainText([
    'my attachment|outside step (before use)',
    'my attachment|in step',
    'my attachment|outside step (after use)',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['error in fixture teardown']);
});
