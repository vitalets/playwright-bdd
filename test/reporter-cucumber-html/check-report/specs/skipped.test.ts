import { test, expect } from '@playwright/test';
import { getScenario, openReport } from '../helpers';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('Scenario: Skipped scenario', async ({ page }) => {
  const scenario = getScenario(page, 'Skipped scenario');
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
});
