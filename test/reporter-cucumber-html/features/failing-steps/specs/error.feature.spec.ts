import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('error in step', async ({ scenario }) => {
  await expect(scenario.getSteps().filter({ hasText: 'Givenstep with page' })).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'Givenfailing step' })).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'WhenAction 1' })).toHaveCount(1);
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText(['expect(true).toBe(false)']);
});

test('failing match snapshot', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Whenstep with page',
    'Thenerror in match snapshot',
  ]);
  await expect(scenario.getAttachments()).toContainText([
    'error-in-step-failing-match-snapshot-1-expected.txtbla-bla',
    'error-in-step-failing-match-snapshot-1-actual.txtExample Domain',
    'screenshot',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['toMatchSnapshot']);
});

test('soft assertions', async ({ scenario }) => {
  await expect(
    scenario.getSteps().filter({ hasText: /Givenfailing soft assertion "foo"/ }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'AndAction 1' })).toHaveCount(1);
  await expect(
    scenario.getSteps().filter({ hasText: /Andfailing soft assertion "bar"/ }),
  ).toHaveCount(1);
  await expect(scenario.getSteps().filter({ hasText: 'AndAction 2' })).toHaveCount(1);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(2);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText([
    'Expected: "foo" Received: "xxx"',
    'Expected: "bar" Received: "xxx"',
  ]);
});
