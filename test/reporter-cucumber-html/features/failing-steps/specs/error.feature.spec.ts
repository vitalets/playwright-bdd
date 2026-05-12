import { expect } from '@playwright/test';
import { expectAttachmentTexts } from '../../../check-report/helpers';
import { test } from '../../../check-report/fixtures';

test('error in step', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given step with page',
    'Given failing step',
    'When Action 1',
  ]);
  await scenario.expandAttachment();
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText(['shared.steps.ts']);
});

test('failing match snapshot', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'When step with page',
    'Then error in match snapshot',
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
  await expect(scenario.getErrors()).toContainText(['steps.ts']);
});

test('soft assertions', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given failing soft assertion "foo"',
    'And Action 1',
    'And failing soft assertion "bar"',
    'And Action 2',
  ]);
  await scenario.expandAttachment();
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(2);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['steps.ts', 'steps.ts']);
});
