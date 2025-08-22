import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    // fixture: prefix was removed in pw 1.53
    /Hook ".+workerFixtureWithErrorInSetup.+" failed:/,
    'GivenAction 1',
    'Givenstep that uses workerFixtureWithErrorInSetup',
    'Download trace',
  ]);
  await expect(scenario.getSteps()).toContainText([
    normalize('features/before-all-hook/fixtures.ts'),
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getErrors()).toContainText(['error in worker fixture setup']);
});
