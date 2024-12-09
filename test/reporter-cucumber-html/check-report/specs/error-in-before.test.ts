import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../fixtures';

test.use({ featureUri: 'error-in-before/sample.feature' });

test('error in anonymous before hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    `Hook "BeforeEach hook" failed: ${normalize('features/error-in-before/steps.ts')}:`, // prettier-ignore
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
    `Hook "failing named before hook" failed: ${normalize('features/error-in-before/steps.ts')}:`,
    'GivenAction 1',
    'screenshotDownload trace',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-before-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in fixture setup (no step)', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    `Hook "fixture: fixtureWithErrorInSetup" failed: ${normalize('features/error-in-before/fixtures.ts')}:`,
    'Givenstep that uses fixtureWithErrorInSetup',
    'WhenAction 1',
    'screenshot',
  ]);
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
    `Hook "step inside fixture" failed: ${normalize('features/error-in-before/fixtures.ts')}:`,
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

test('timeout in fixture setup', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Givenstep that uses fixtureWithTimeoutInSetup',
    'WhenAction 1',
  ]);
  // 1. position of error message sometimes appears in After Hooks, so check it separately
  // 2. here can be different error messages
  await expect(scenario.getSteps()).toContainText([/Hook "(.+)" failed/]);
  // screenshot position changes between PW versions, so check it separately
  await expect(scenario.getSteps()).toContainText(['screenshot']);
  // sometimes error is the following:
  // "browser.newContext: Target page, context or browser has been closed"
  // in that case there are two errors in test report.
  expect(await scenario.getSteps('failed').count()).toBeGreaterThan(0);
  await expect(scenario.getSteps('skipped')).toHaveCount(3);
  await expect(scenario.getErrors()).toContainText([
    // here can be different error messages
    /(Test timeout of \d+ms exceeded while setting up "fixtureWithTimeoutInSetup")|(browser has been closed)|(Browser closed)|(Page closed)/,
  ]);
});

test('timeout in before hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    /Hook "(BeforeEach hook|fixture: \$beforeEach)" failed:/, // prettier-ignore
    'GivenAction 1',
  ]);
  await expect(scenario.getErrors()).toContainText([
    // here can be different error messages
    /(Test timeout of \d+ms exceeded while running "beforeEach" hook)|(browser has been closed)|(Browser closed)|(Page closed)/,
  ]);
});
