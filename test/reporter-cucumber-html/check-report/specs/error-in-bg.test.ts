import { expect } from '@playwright/test';
import { test } from '../fixtures';

test.use({ featureUri: 'error-in-bg/sample.feature' });

test('background is failing', async ({ feature }) => {
  const background = feature.getBackground();
  await expect(background.getSteps()).toContainText([
    'failing step', // prettier-ignore
  ]);
  await expect(background.getSteps('failed')).toHaveCount(1);
  await expect(background.getErrors()).toContainText(['Timed out 1ms waiting for expect']);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 1', // prettier-ignore
    'screenshot',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 2', // prettier-ignore
    'screenshot',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();
});
