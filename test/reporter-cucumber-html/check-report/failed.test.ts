import { normalize } from 'node:path';
import { test, expect } from '@playwright/test';
import { getFeature, getScenario, openReport } from './helpers';
import { getPackageVersion } from '../../../src/utils';

const pwVersion = getPackageVersion('@playwright/test');

// Automatic screenshot for failing fixtures teardown depends on pw version.
// see: https://github.com/microsoft/playwright/issues/29325
const hasAutoScreenshotFixtureTeardown = pwVersion >= '1.42.0' && pwVersion < '1.45.0';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('Scenario: Failing by step', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by step');
  await expect(scenario.getSteps()).toContainText(['Givenfailing step', 'screenshot']);
  await expect(scenario.getErrors()).toContainText(['Timed out']);
});

test('Scenario: Failing by background step', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by background step');
  await expect(scenario.getSteps()).toContainText(['GivenAction 1', 'screenshot']);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();

  const background = getFeature(page).getBackground();
  await expect(background.getSteps()).toContainText([
    'step failing for scenario "Failing by background step"',
  ]);
  await expect(background.getSteps('failed')).toHaveCount(1);
  await expect(background.getErrors()).toContainText(['expect(true).toEqual(false)']);
});

test('Scenario: Failing by anonymous before hook', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by anonymous before hook');
  await expect(scenario.getSteps()).toContainText([
    `Hook failed: ${normalize('features/failed-steps.ts')}:`, // prettier-ignore
    'GivenAction 1',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-hook']);
  await expect(scenario.getErrors()).toContainText(['Timed out']);
  await expect(scenario.getErrors()).toContainText([`Before({ tags: '@failing-anonymous-hook' }`]);
});

test('Scenario: Failing by named before hook', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by named before hook');
  await expect(scenario.getSteps()).toContainText([
    `Hook "failing named before hook" failed: ${normalize('features/failed-steps.ts')}:`,
    'GivenAction 1',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-hook']);
  await expect(scenario.getErrors()).toContainText(['Timed out']);
  await expect(scenario.getErrors()).toContainText([`Before({ name: 'failing named before hook'`]);
});

test('Scenario: Failing by failingBeforeFixtureNoStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingBeforeFixtureNoStep');
  await expect(scenario.getSteps()).toContainText([
    `Hook "fixture: failingBeforeFixtureNoStep" failed: ${normalize('features/fixtures.ts')}:`,
    'Givenstep that uses failingBeforeFixtureNoStep',
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
  await expect(scenario.getErrors()).toContainText(['error in failingBeforeFixtureNoStep']);
});

test('Scenario: Failing by failingBeforeFixtureWithStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingBeforeFixtureWithStep');
  await expect(scenario.getSteps()).toContainText([
    `Hook "my step" failed: ${normalize('features/fixtures.ts')}:`,
    'Givenstep that uses failingBeforeFixtureWithStep',
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
  await expect(scenario.getErrors()).toContainText(['error in failingBeforeFixtureWithStep']);
});

test('Scenario: Failing by failingAfterFixtureNoStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingAfterFixtureNoStep');
  await expect(scenario.getSteps()).toContainText([
    'my attachment|before use',
    'Givenstep that uses failingAfterFixtureNoStep',
    'WhenAction 3',
    `Hook "fixture: failingAfterFixtureNoStep" failed: ${normalize('features/fixtures.ts')}:`,
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

test('Scenario: Failing by failingAfterFixtureWithStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingAfterFixtureWithStep');
  await expect(scenario.getSteps()).toContainText([
    'my attachment|outside step (before use)',
    'Givenstep that uses failingAfterFixtureWithStep',
    'WhenAction 4',
    `Hook "step in failingAfterFixtureWithStep" failed: ${normalize('features/fixtures.ts')}:`,
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

test('Scenario: failing match snapshot', async ({ page }) => {
  const scenario = getScenario(page, 'failing match snapshot');
  await expect(scenario.getSteps()).toContainText([
    'Whenopen page "https://example.com"',
    'Thenpage title snapshot matches the golden one',
  ]);
  await expect(scenario.getAttachments()).toHaveText([
    'rich-feature-failing-match-snapshot-1-expected.txtbla-bla',
    'rich-feature-failing-match-snapshot-1-actual.txtExample Domain',
    'screenshot',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['Snapshot comparison failed']);
});

test('Scenario: soft assertions', async ({ page }) => {
  const scenario = getScenario(page, 'soft assertions');
  await expect(scenario.getSteps()).toHaveText([
    /Givenfailing soft assertion "foo"/,
    'AndAction 1',
    /Andfailing soft assertion "bar"/,
    'AndAction 2',
    'screenshot',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(2);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText([
    'Expected: "foo" Received: "xxx"',
    'Expected: "bar" Received: "xxx"',
  ]);
});
