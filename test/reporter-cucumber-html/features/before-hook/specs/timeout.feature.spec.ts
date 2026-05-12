import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('timeout in fixture setup', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    /Before(?:: .+)?/,
    'Given Action 0',
    'Given step that uses fixtureWithTimeoutInSetup',
    'When Action 1',
  ]);
  // sometimes error is the following:
  // "browser.newContext: Target page, context or browser has been closed"
  // in that case there are two errors in test report.
  expect(await scenario.getSteps('failed').count()).toBeGreaterThan(0);
  await expect(scenario.getSteps('skipped')).toHaveCount(3);
  await expect(scenario.getErrors()).toContainText([
    // here can be different error messages
    /(Test timeout of \d+ms exceeded while setting up "fixtureWithTimeoutInSetup")|(browser has been closed)|(Browser closed)|(Page closed)/,
  ]);
});

test('timeout in before hook', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText([
    /Before(?:: (my timeouted hook|BeforeEach Hooks|Before Hooks|fixture: .+))?/,
    'Given Action 1',
  ]);
  await expect(scenario.getErrors()).toContainText([
    // New reporter only shows callstack for hook timeouts (no message text)
    /timeout\.feature\.spec/,
  ]);
});
