import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';
import { hasDownloadTrace } from './helpers';

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText(
    [
      `Hook "my hook" failed: ${normalize('features/failing-before-all/steps.ts')}:`, // prettier-ignore
      'GivenAction 1',
      hasDownloadTrace ? 'Download trace' : '',
    ].filter(Boolean),
  );
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([`expect(true).toEqual(false)`]);
});
