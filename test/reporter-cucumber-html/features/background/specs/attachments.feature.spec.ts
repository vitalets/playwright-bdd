import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('attachment in bg', async ({ feature }) => {
  const scenario1 = feature.getScenario('scenario 1');
  const scenario2 = feature.getScenario('scenario 2');

  await expect(scenario1.getStepTitles()).toHaveText([
    'Given step with attachment',
    'Given Action 1',
  ]);
  await expect(scenario1.getAttachments()).toHaveText([
    'step with attachment|attachment for scenario scenario 1',
  ]);

  await expect(scenario2.getStepTitles()).toHaveText([
    'Given step with attachment',
    'Given Action 2',
  ]);
  await expect(scenario2.getAttachments()).toHaveText([
    'step with attachment|attachment for scenario scenario 2',
  ]);
});
