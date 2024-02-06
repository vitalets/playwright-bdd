import { test, expect } from '@playwright/test';
import { getFeature, getScenario, openReport } from './helpers';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('Scenario: Failing by step', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by step');
  await expect(scenario.getSteps()).toContainText(['Givenfailing step', 'screenshot']);
  await expect(scenario.getError()).toContainText('Timed out');
});

test('Scenario: Failing by background step', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by background step');
  await expect(scenario.getSteps()).toContainText(['GivenAction 1', 'screenshot']);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getError()).not.toBeVisible();

  const background = getFeature(page).getBackground();
  await expect(background.getSteps()).toContainText([
    'step failing for scenario "Failing by background step"',
  ]);
  await expect(background.getSteps('failed')).toHaveCount(1);
  await expect(background.getError()).toContainText('expect(true).toEqual(false)');
});

test('Scenario: Failing by anonymous before hook', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by anonymous before hook');
  await expect(scenario.getSteps()).toContainText([
    'Hook failed: features/failed-steps.ts:', // prettier-ignore
    'GivenAction 1',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-hook']);
  await expect(scenario.getError()).toContainText('Timed out');
  await expect(scenario.getError()).toContainText(`Before({ tags: '@failing-anonymous-hook' }`);
});

test('Scenario: Failing by named before hook', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by named before hook');
  await expect(scenario.getSteps()).toContainText([
    'Hook "failing named before hook" failed: features/failed-steps.ts:',
    'GivenAction 1',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-hook']);
  await expect(scenario.getError()).toContainText('Timed out');
  await expect(scenario.getError()).toContainText(`Before({ name: 'failing named before hook'`);
});

test('Scenario: Failing by failingBeforeFixtureNoStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingBeforeFixtureNoStep');
  await expect(scenario.getSteps()).toContainText([
    'Hook "fixture: failingBeforeFixtureNoStep" failed: features/fixtures.ts:',
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
  await expect(scenario.getError()).toContainText('error in failingBeforeFixtureNoStep');
});

test('Scenario: Failing by failingBeforeFixtureWithStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingBeforeFixtureWithStep');
  await expect(scenario.getSteps()).toContainText([
    'Hook "my step" failed: features/fixtures.ts:',
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
  await expect(scenario.getError()).toContainText('error in failingBeforeFixtureWithStep');
});

test('Scenario: Failing by failingAfterFixtureNoStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingAfterFixtureNoStep');
  await expect(scenario.getSteps()).toContainText([
    'my attachment|before use',
    'Givenstep that uses failingAfterFixtureNoStep',
    'WhenAction 3',
    'Hook "fixture: failingAfterFixtureNoStep" failed: features/fixtures.ts:',
    // there is no automatic screenshot here
    // see: https://github.com/microsoft/playwright/issues/29325
  ]);
  await expect(scenario.getAttachments()).toHaveText([
    'my attachment|before use',
    'my attachment|after use',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getError()).toContainText('error in failingAfterFixtureNoStep');
});

test('Scenario: Failing by failingAfterFixtureWithStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingAfterFixtureWithStep');
  await expect(scenario.getSteps()).toContainText([
    'my attachment|outside step (before use)',
    'Givenstep that uses failingAfterFixtureWithStep',
    'WhenAction 4',
    'Hook "step in failingAfterFixtureWithStep" failed: features/fixtures.ts:',
  ]);
  await expect(scenario.getAttachments()).toHaveText([
    'my attachment|outside step (before use)',
    'my attachment|in step',
    'my attachment|outside step (after use)',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getError()).toContainText('error in failingAfterFixtureWithStep');
});
