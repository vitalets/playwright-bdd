import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('timeout in bg', async ({ feature }) => {
  const scenario = feature.getScenario('scenario 1');
  await expect(scenario.getStepTitles()).toContainText(['Given Action 0', 'Given timeouted step']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([
    // New reporter only shows callstack for hook timeouts (no message text)
    /timeout\.feature\.spec/,
  ]);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    'Given Action 0',
    'Given timeouted step',
    'Given Action 1',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    'Given Action 0',
    'Given timeouted step',
    'Given Action 2',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
});
