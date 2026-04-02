import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('background is failing', async ({ feature }) => {
  const scenario = feature.getScenario('scenario 1');
  await expect(scenario.getStepTitles()).toContainText(['GivenAction 0', 'Givenfailing step']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText(['expect(true).toBe(false)']);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'GivenAction 0',
    'Givenfailing step',
    'GivenAction 1',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'GivenAction 0',
    'Givenfailing step',
    'GivenAction 2',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
});
