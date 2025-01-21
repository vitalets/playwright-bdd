import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('timeout in bg', async ({ feature }) => {
  const background = feature.getBackground();
  await expect(background.getSteps()).toContainText([
    'GivenAction 0', // prettier-ignore
    'Giventimeouted step',
  ]);
  await expect(background.getSteps('failed')).toHaveCount(1);
  await expect(background.getErrors()).toContainText([
    /Test timeout of \d+ms exceeded while running "beforeEach" hook/,
  ]);
});

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 1', // prettier-ignore
    'Download trace',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  // Can't ensure that there will be no errors.
  // If timeouted bg step has real duration and no 'error' -> no way to find it
  // In that case each scenario will show: Hook "Background" failed
  // await expect(scenario.getErrors()).not.toBeVisible();
});

test('scenario 2', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 2', // prettier-ignore
    'Download trace',
  ]);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  // Can't ensure that there will be no errors.
  // If timeouted bg step has real duration and no 'error' -> no way to find it
  // In that case each scenario will show: Hook "Background" failed
  // await expect(scenario.getErrors()).not.toBeVisible();
});
