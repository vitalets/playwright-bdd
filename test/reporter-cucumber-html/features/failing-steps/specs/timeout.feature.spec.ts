import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('timeout in step', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    'Givenstep with page',
    'Giventimeouted step',
    'WhenAction 1',
  ]);
  // don't check passed/skipped steps counts b/c in different PW versions it's different
  await expect(scenario.getErrors()).toContainText([/Test timeout of \d+ms exceeded/]);
});
