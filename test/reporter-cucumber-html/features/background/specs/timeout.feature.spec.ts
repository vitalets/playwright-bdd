import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('timeout in bg', async ({ feature }) => {
  const scenario = feature.getScenario('scenario 1');
  await expect(scenario.getStepTitles()).toContainText(['GivenAction 0', 'Giventimeouted step']);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([
    /Test timeout of \d+ms exceeded while running "beforeEach" hook/,
  ]);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'GivenAction 1',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'GivenAction 2',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
});
