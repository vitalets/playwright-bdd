import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('attachment in bg', async ({ feature }) => {
  const background = feature.getBackground();
  await expect(background.getSteps()).toContainText([
    'Givenstep with attachment', // prettier-ignore
  ]);
  await expect(background.getAttachments()).toHaveText([
    'step with attachment|attachment for scenario scenario 1',
    'step with attachment|attachment for scenario scenario 2',
  ]);
  await expect(feature.getScenario('scenario 1').getAttachments()).toHaveCount(0);
  await expect(feature.getScenario('scenario 2').getAttachments()).toHaveCount(0);
});
