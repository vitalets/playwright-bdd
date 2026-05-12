import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('background is failing', async ({ feature }) => {
  const scenario = feature.getScenario('scenario 1');
  await expect(scenario.getStepTitles()).toContainText(['Given Action 0', 'Given failing step']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText(['shared.steps.ts']);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given Action 0',
    'Given failing step',
    'Given Action 1',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given Action 0',
    'Given failing step',
    'Given Action 2',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
});
