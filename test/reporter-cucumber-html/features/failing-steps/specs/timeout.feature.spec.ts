import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('timeout in step', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Givenstep with page', // prettier-ignore
    'Giventimeouted step',
    'WhenAction 1',
    'screenshot',
    // don't check 'Download trace' as it is attached to 'timeouted step' in pw 1.42 / 1.43
    // 'Download trace',
  ]);
  // don't check passed/skipped steps counts b/c in different PW versions it's different
  await expect(scenario.getErrors()).toContainText([/Test timeout of \d+ms exceeded/]);
});
