import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { getPackageVersion } from '../../../../src/utils';

// Automatic screenshot for failing fixtures teardown depends on pw version.
// see: https://github.com/microsoft/playwright/issues/29325
const pwVersion = getPackageVersion('@playwright/test');
const hasScreenshotAfterHookError = pwVersion >= '1.42.0';

test.use({ featureUri: 'error-in-after/sample.feature' });

test('error in anonymous after hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText(
    [
      'Givenstep with page',
      `Hook "AfterEach hook" failed: ${normalize('features/error-in-after/steps.ts')}:`, // prettier-ignore
      hasScreenshotAfterHookError ? 'screenshotDownload trace' : '',
    ].filter(Boolean),
  );
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-after-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in named after hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText(
    [
      'Givenstep with page',
      `Hook "failing named after hook" failed: ${normalize('features/error-in-after/steps.ts')}:`,
      hasScreenshotAfterHookError ? 'screenshotDownload trace' : '',
    ].filter(Boolean),
  );
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-after-hook']);
  await expect(scenario.getErrors()).toContainText([`expect(page).toHaveTitle`]);
});

test('error in fixture teardown (no step)', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'my attachment|before use',
    'Givenstep with page',
    'Givenstep that uses fixtureWithErrorInTeardown',
    'WhenAction 1',
    `Hook "fixture: fixtureWithErrorInTeardown" failed: ${normalize('features/error-in-after/fixtures.ts')}:`,
  ]);
  if (hasScreenshotAfterHookError) {
    // position of screenshot item can vary
    await expect(scenario.getSteps()).toContainText(['screenshot']);
  }
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
  await expect(scenario.getSteps()).toContainText([
    'my attachment|outside step (before use)',
    'Givenstep with page',
    'Givenstep that uses fixtureWithErrorInTeardownStep',
    'WhenAction 1',
    `Hook "step inside fixture" failed: ${normalize('features/error-in-after/fixtures.ts')}:`,
    'my attachment|outside step (after use)',
  ]);
  if (hasScreenshotAfterHookError) {
    // position of screenshot item can vary
    await expect(scenario.getSteps()).toContainText(['screenshot']);
  }
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

test('timeout in fixture teardown', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Givenstep that uses fixtureWithTimeoutInTeardown',
    'WhenAction 1',
    /Hook "(After Hooks|fixture: fixtureWithTimeoutInTeardown)" failed/,
  ]);
  // don't check screenshot as it's not reliable in timeouts
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([
    /but tearing down "fixtureWithTimeoutInTeardown" ran out of time|Tearing down "fixtureWithTimeoutInTeardown" exceeded the test timeout/,
  ]);
});

test('timeout in step and in fixture teardown', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'WhenAction 1',
    'Givenstep that uses fixtureWithTimeoutInTeardown',
    /Hook "(After Hooks|fixture: fixtureWithTimeoutInTeardown)" failed/,
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(4);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([
    /Test timeout of \d+ms exceeded|Tearing down "fixtureWithTimeoutInTeardown" exceeded the test timeout/,
  ]);
});

test('timeout in after hook', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Givenstep with page',
    'Hook "After Hooks" failed',
  ]);
  await expect(scenario.getErrors()).toContainText([
    /but tearing down "\$afterEach" ran out of time|Tearing down "\$afterEach" exceeded the test timeout/,
  ]);
});
