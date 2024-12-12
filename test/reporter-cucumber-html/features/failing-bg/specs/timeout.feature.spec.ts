import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('timeout in bg', async ({ feature }) => {
  const background = feature.getBackground();
  await expect(background.getSteps()).toContainText([
    'step with page', // prettier-ignore
    'timeouted step',
  ]);
  await expect(background.getSteps('failed')).toHaveCount(1);
  await expect(background.getErrors()).toContainText([
    /Test timeout of \d+ms exceeded while running "beforeEach" hook/,
  ]);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Action 1', // prettier-ignore
    'screenshotDownload trace',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Action 2', // prettier-ignore
    'screenshotDownload trace',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).not.toBeVisible();
});
