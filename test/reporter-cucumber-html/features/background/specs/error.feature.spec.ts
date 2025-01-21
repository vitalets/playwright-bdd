import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('background is failing', async ({ feature }) => {
  const background = feature.getBackground();
  await expect(background.getSteps()).toContainText([
    'Action 0', // prettier-ignore
    'failing step',
  ]);
  await expect(background.getSteps('failed')).toHaveCount(1);
  await expect(background.getErrors()).toContainText(['expect(true).toBe(false)']);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Action 1', // prettier-ignore
    'Download trace',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Action 2', // prettier-ignore
    'Download trace',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();
});
