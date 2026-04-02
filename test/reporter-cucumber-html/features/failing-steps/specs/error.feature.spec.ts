import { expect } from '@playwright/test';
import { expectAttachmentTexts } from '../../../check-report/helpers';
import { test } from '../../../check-report/fixtures';

test('error in step', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Givenstep with page',
    'Givenfailing step',
    'WhenAction 1',
  ]);
  await scenario.expandAttachment();
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText(['expect(true).toBe(false)']);
});

test('failing match snapshot', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Whenstep with page',
    'Thenerror in match snapshot',
  ]);
  await scenario.expandAttachment();
  await expectAttachmentTexts(scenario.getAttachments(), [
    'error-in-step-failing-match-snapshot-1-expected.txtbla-bla',
    'error-in-step-failing-match-snapshot-1-actual.txtExample Domain',
    'screenshot',
  ]);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['toMatchSnapshot']);
});

test('soft assertions', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Givenfailing soft assertion "foo"',
    'AndAction 1',
    'Andfailing soft assertion "bar"',
    'AndAction 2',
  ]);
  await scenario.expandAttachment();
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(2);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText([
    'Expected: "foo" Received: "xxx"',
    'Expected: "bar" Received: "xxx"',
  ]);
});
