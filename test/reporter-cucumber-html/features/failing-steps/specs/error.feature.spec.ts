import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('error in step', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Givenstep with page', // prettier-ignore
    'Givenfailing step',
    'WhenAction 1',
    'screenshotDownload trace',
  ]);
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
  await expect(scenario.getAttachments()).toHaveText([
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
  await expect(scenario.getSteps()).toHaveText([
    /Givenfailing soft assertion "foo"/,
    'AndAction 1',
    /Andfailing soft assertion "bar"/,
    'AndAction 2',
    // not 'screenshot', b/c no page
    // 'screenshot',
    'Download trace',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(2);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText([
    'Expected: "foo" Received: "xxx"',
    'Expected: "bar" Received: "xxx"',
  ]);
});
