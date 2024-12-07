import { expect } from '@playwright/test';
import { test } from '../fixtures';

test.use({ featureUri: 'error-in-step/sample.feature' });

test('failing by step assertion', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Givenfailing step', // prettier-ignore
    'screenshotDownload trace',
  ]);
  await expect(scenario.getErrors()).toContainText([
    'Timed out 1ms waiting for expect', // prettier-ignore
  ]);
});

test('failing by step timeout', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 0',
    'Giventimeouted step',
    'WhenAction 1',
    // not 'screenshot', b/c no page
    // 'screenshot',
    'Download trace',
  ]);
  // don't check passed/skipped steps counts b/c in different PW versions it's different
  await expect(scenario.getErrors()).toContainText([/Test timeout of \d+ms exceeded/]);
});

test('failing match snapshot', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'Whenopen page "https://example.com"',
    'Thenpage title snapshot matches the golden one',
  ]);
  await expect(scenario.getAttachments()).toHaveText([
    'error-in-step-failing-match-snapshot-1-expected.txtbla-bla',
    'error-in-step-failing-match-snapshot-1-actual.txtExample Domain',
    'screenshot',
  ]);
  await expect(scenario.getSteps('passed')).toHaveCount(1);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  // since pw 1.49 error text for snapshots was changed.
  // before: Snapshot comparison failed
  // after: expect(string).toMatchSnapshot(expected)
  await expect(scenario.getErrors()).toContainText(
    /Snapshot comparison failed|expect\(string\)\.toMatchSnapshot\(expected\)/,
  );
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
