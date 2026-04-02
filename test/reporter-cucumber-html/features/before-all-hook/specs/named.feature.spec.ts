import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('scenario 1', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText(
    ['BeforeAll: my hook', 'GivenAction 1'].filter(Boolean),
  );
  await expect(scenario.root).toContainText(normalize('features/before-all-hook/steps.ts'));
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([`expect(true).toEqual(false)`]);
});
