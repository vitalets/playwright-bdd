import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { fixtureHookTitleRegexp } from '../../../check-report/helpers';
import { test } from '../../../check-report/fixtures';

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    fixtureHookTitleRegexp('BeforeAll', 'workerFixtureWithErrorInSetup'),
    'GivenAction 1',
    'Givenstep that uses workerFixtureWithErrorInSetup',
  ]);
  await expect(scenario.root).toContainText(normalize('features/before-all-hook/fixtures.ts'));
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getErrors()).toContainText(['error in worker fixture setup']);
});
