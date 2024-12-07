import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { getPackageVersion } from '../../../../src/utils';

// Automatic screenshot for failing fixtures teardown depends on pw version.
// see: https://github.com/microsoft/playwright/issues/29325
const pwVersion = getPackageVersion('@playwright/test');
const hasAutoScreenshotFixtureTeardown = pwVersion >= '1.42.0' && pwVersion < '1.45.0';

test.use({ featureUri: 'error-in-after/sample.feature' });

test('error in fixture teardown (no step)', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'my attachment|before use',
    'Givenstep that uses fixtureWithErrorInTeardown',
    'WhenAction 1',
    `Hook "fixture: fixtureWithErrorInTeardown" failed: ${normalize('features/error-in-after/fixtures.ts')}:`,
  ]);
  if (hasAutoScreenshotFixtureTeardown) {
    await expect(scenario.getSteps()).toContainText(['screenshot']);
  }
  await expect(scenario.getAttachments()).toContainText([
    'my attachment|before use', // prettier-ignore
    'my attachment|after use',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['error in fixture teardown']);
});

test('error in fixture teardown (with step)', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'my attachment|outside step (before use)',
    'Givenstep that uses fixtureWithErrorInTeardownStep',
    'WhenAction 1',
    `Hook "step inside fixture" failed: ${normalize('features/error-in-after/fixtures.ts')}:`,
    'my attachment|outside step (after use)',
  ]);
  if (hasAutoScreenshotFixtureTeardown) {
    await expect(scenario.getSteps()).toContainText(['screenshot']);
  }
  await expect(scenario.getAttachments()).toContainText([
    'my attachment|outside step (before use)',
    'my attachment|in step',
    'my attachment|outside step (after use)',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
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
