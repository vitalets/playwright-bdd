import { test, expect } from '@playwright/test';
import { getScenario, openReport } from './helpers';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('Scenario: timeout in before fixture', async ({ page }) => {
  const scenario = getScenario(page, 'timeout in before fixture');
  await expect(scenario.getSteps()).toContainText([
    // here can be different error messages
    /Hook "fixture: (.+)" failed/,
    'GivenAction 0',
    'Givenstep that uses timeouted before fixture',
    'WhenAction 1',
  ]);
  // screenshot position changes between PW versions, so check it separately
  await expect(scenario.getSteps()).toContainText(['screenshot']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(3);
  await expect(scenario.getError()).toContainText(
    // here can be two different error messages
    // eslint-disable-next-line max-len
    /(Test timeout of \d+ms exceeded while setting up "timeoutedBeforeFixture")|(browser has been closed)|(Browser closed)/,
  );
});

test('Scenario: timeout in step', async ({ page }) => {
  const scenario = getScenario(page, 'timeout in step');
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'WhenAction 1',
    'screenshot',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getError()).toContainText(/Test timeout of \d+ms exceeded/);
  await expect(scenario.getError()).toContainText('page.waitForTimeout');
});

test('Scenario: timeout in after fixture', async ({ page }) => {
  const scenario = getScenario(page, 'timeout in after fixture');
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Givenstep that uses timeouted after fixture',
    'WhenAction 1',
    'Hook "After Hooks" failed: Unknown location',
  ]);
  await expect(scenario.getSteps()).toContainText(['screenshot']);
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getError()).toContainText('Test finished within timeout');
  await expect(scenario.getError()).toContainText(
    'but tearing down "timeoutedAfterFixture" ran out of time',
  );
});

test('Scenario: timeout in step and in after fixture', async ({ page }) => {
  const scenario = getScenario(page, 'timeout in step and in after fixture');
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'WhenAction 1',
    'Givenstep that uses timeouted after fixture',
    'Hook "After Hooks" failed: Unknown location',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(4);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getError()).toContainText(/Test timeout of \d+ms exceeded/);
});
