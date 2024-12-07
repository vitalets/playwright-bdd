import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { getPackageVersion } from '../../../../src/utils';

// Automatic screenshot for failing fixtures teardown depends on pw version.
// see: https://github.com/microsoft/playwright/issues/29325
const pwVersion = getPackageVersion('@playwright/test');
const hasAutoScreenshotFixtureTeardown = pwVersion >= '1.42.0' && pwVersion < '1.45.0';

test.use({ featureUri: 'error-in-after/sample.feature' });

test('Failing by failingAfterFixtureNoStep', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'my attachment|before use',
    'Givenstep that uses failingAfterFixtureNoStep',
    'WhenAction 3',
    `Hook "fixture: failingAfterFixtureNoStep" failed: ${normalize('features/error-in-after/fixtures.ts')}:`,
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
  await expect(scenario.getErrors()).toContainText(['error in failingAfterFixtureNoStep']);
});

test('Failing by failingAfterFixtureWithStep', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'my attachment|outside step (before use)',
    'Givenstep that uses failingAfterFixtureWithStep',
    'WhenAction 4',
    `Hook "step in failingAfterFixtureWithStep" failed: ${normalize('features/error-in-after/fixtures.ts')}:`,
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
  await expect(scenario.getErrors()).toContainText(['error in failingAfterFixtureWithStep']);
});

test('timeout in after fixture', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Givenstep that uses timeouted after fixture',
    'WhenAction 1',
    /Hook "(After Hooks|fixture: timeoutedAfterFixture)" failed/,
  ]);
  // don't check screenshot as it's not reliable in timeouts
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([
    /but tearing down "timeoutedAfterFixture" ran out of time|Tearing down "timeoutedAfterFixture" exceeded the test timeout/,
  ]);
});

test('timeout in step and in after fixture', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'WhenAction 1',
    'Givenstep that uses timeouted after fixture',
    /Hook "(After Hooks|fixture: timeoutedAfterFixture)" failed/,
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(4);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([
    /Test timeout of \d+ms exceeded|Tearing down "timeoutedAfterFixture" exceeded the test timeout/,
  ]);
});
