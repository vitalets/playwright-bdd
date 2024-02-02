import { test, expect } from '@playwright/test';
import { getFeature, getScenario, openReport } from './helpers';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('Scenario: Failing by step', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by step');
  await expect(scenario.getSteps()).toContainText(['failing step', 'screenshot']);
  await expect(scenario.getError()).toContainText('Timed out 1ms');
});

test('Scenario: Failing by background step', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by background step');
  await expect(scenario.getSteps()).toContainText(['Action 1', 'screenshot']);
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
  await expect(scenario.getSteps()).toContainText(['Hook failed', 'Action 1', 'screenshot']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-hook']);
  await expect(scenario.getError()).toContainText('Timed out 1ms');
  await expect(scenario.getError()).toContainText(`Before({ tags: '@failing-anonymous-hook' }`);
});

test('Scenario: Failing by named before hook', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by named before hook');
  await expect(scenario.getSteps()).toContainText([
    'Hook "failing named before hook" failed',
    'Action 1',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-hook']);
  await expect(scenario.getError()).toContainText('Timed out 1ms');
  await expect(scenario.getError()).toContainText(`Before({ name: 'failing named before hook'`);
});

test('Scenario: Failing by failingBeforeFixtureNoStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingBeforeFixtureNoStep');
  await expect(scenario.getSteps()).toContainText([
    'Hook "fixture: failingBeforeFixtureNoStep" failed',
    'step that uses failingBeforeFixtureNoStep',
    'Action 1',
    'screenshot',
  ]);
  await expect(scenario.getAttachments()).toContainText([
    'attachment in failingBeforeFixtureNoStep',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getError()).toContainText('error in failingBeforeFixtureNoStep');
});

test('Scenario: Failing by failingBeforeFixtureWithStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingBeforeFixtureWithStep');
  await expect(scenario.getSteps()).toContainText([
    'Hook "step in failingBeforeFixtureWithStep" failed',
    'step that uses failingBeforeFixtureWithStep',
    'Action 2',
    'screenshot',
  ]);
  await expect(scenario.getAttachments()).toContainText([
    'attachment in failingBeforeFixtureWithStep',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getError()).toContainText('error in failingBeforeFixtureWithStep');
});

test('Scenario: Failing by failingAfterFixtureNoStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingAfterFixtureNoStep');
  await expect(scenario.getSteps()).toContainText([
    'attachment in failingAfterFixtureNoStep (before use)',
    'step that uses failingAfterFixtureNoStep',
    'Action 3',
    'Hook "fixture: failingAfterFixtureNoStep" failed',
    // there is no automatic screenshot here
    // see: https://github.com/microsoft/playwright/issues/29325
  ]);
  await expect(scenario.getAttachments()).toContainText([
    'attachment in failingAfterFixtureNoStep (before use)',
    'attachment in failingAfterFixtureNoStep (after use)',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getError()).toContainText('error in failingAfterFixtureNoStep');
});

test('Scenario: Failing by failingAfterFixtureWithStep', async ({ page }) => {
  const scenario = getScenario(page, 'Failing by failingAfterFixtureWithStep');
  await expect(scenario.getSteps()).toContainText([
    'attachment in failingAfterFixtureWithStep (before use)',
    'step that uses failingAfterFixtureWithStep',
    'Action 4',
    'Hook "step in failingAfterFixtureWithStep" failed',
  ]);
  await expect(scenario.getAttachments()).toContainText([
    'attachment in failingAfterFixtureWithStep (before use)',
    'attachment in failingAfterFixtureWithStep (after use)',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getError()).toContainText('error in failingAfterFixtureWithStep');
});
