import { expect } from '@playwright/test';
import { test } from '../fixtures';

test.use({ featureUri: 'failing-bg/error.feature' });

test('background is failing', async ({ feature }) => {
  const background = feature.getBackground();
  await expect(background.getSteps()).toContainText([
    'step with page', // prettier-ignore
    'failing step',
  ]);
  await expect(background.getSteps('failed')).toHaveCount(1);
  await expect(background.getErrors()).toContainText(['expect(true).toBe(false)']);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 1', // prettier-ignore
    'screenshotDownload trace',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 2', // prettier-ignore
    'screenshotDownload trace',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();
});
