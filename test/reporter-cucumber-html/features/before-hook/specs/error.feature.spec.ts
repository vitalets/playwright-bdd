import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('error in anonymous before hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    `Hook "BeforeEach hook" failed: ${normalize('features/before-hook/steps.ts')}:`, // prettier-ignore
    'GivenAction 1',
    'screenshotDownload trace',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-before-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in named before hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    `Hook "failing named before hook" failed: ${normalize('features/before-hook/steps.ts')}:`,
    'GivenAction 1',
    'screenshotDownload trace',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-before-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in nested step in before hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    `Hook "my step" failed: ${normalize('features/before-hook/steps.ts')}:`,
    'GivenAction 1',
    'screenshotDownload trace',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in fixture setup (no step)', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    /Hook ".*fixtureWithErrorInSetup.*" failed:/,
    'Givenstep that uses fixtureWithErrorInSetup',
    'WhenAction 1',
    'screenshot',
  ]);
  await expect(scenario.getSteps()).toContainText([normalize('features/before-hook/fixtures.ts')]);
  await expect(scenario.getAttachments()).toHaveText([
    'my attachment|outside step',
    'my attachment|in step',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getErrors()).toContainText(['error in fixture setup']);
});

test('error in fixture setup (with step)', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    `Hook "step inside fixture" failed: ${normalize('features/before-hook/fixtures.ts')}:`,
    'Givenstep that uses fixtureWithErrorInSetupStep',
    'WhenAction 2',
    'screenshot',
  ]);
  await expect(scenario.getAttachments()).toHaveText([
    'my attachment|in step',
    'my attachment|outside step',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getErrors()).toContainText(['error in fixture setup']);
});
