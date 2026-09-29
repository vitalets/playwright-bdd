import { expect } from '@playwright/test';
import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  expectCalls,
  playwrightVersion,
} from '../_helpers/index.mjs';
import { getMessagesFromFile } from '../_helpers/reports/messages.mjs';
import { formatMessagesReport } from '../_helpers/reports/messages-formatter.mjs';

const testDir = new TestDir(import.meta);

// $step.skip() relies on TestStepInfo.skip(), that appeared in Playwright 1.51
const hasStepSkip = playwrightVersion >= '1.51';

test(`${testDir.name} (skip in step)`, { skip: !hasStepSkip }, () => {
  const stdout = runFeature('skip-in-step');

  expectCalls('worker 0: ', stdout, [
    'a passing step',
    'AfterStep: a passing step, error: unset',
    'before skip',
    'AfterStep: a step that skips itself, error: unset',
    'the next step runs',
    'AfterStep: the next step runs, error: unset',
    'a step with a false skip condition',
    'the next step runs',
  ]);

  const messages = getMessages('skip-in-step');
  expect(formatMessagesReport(messages)).toEqual(
    [
      'Scenario: step that skips itself [attempt 0]',
      '  PASS a passing step',
      '  SKIP a step that skips itself',
      '  PASS the next step runs',
      'Scenario: step with a false skip condition [attempt 0]',
      '  PASS a step with a false skip condition',
      '  PASS the next step runs',
    ].join('\n'),
  );
  expect(getSkipReasons(messages)).toEqual(['Skipped on purpose']);
});

test(`${testDir.name} (skip in BeforeStep)`, { skip: !hasStepSkip }, () => {
  const stdout = runFeature('skip-in-before-step');

  expectCalls('worker 0: ', stdout, ['a passing step', 'the next step runs']);

  const messages = getMessages('skip-in-before-step');
  expect(formatMessagesReport(messages)).toEqual(
    [
      'Scenario: step skipped in BeforeStep [attempt 0]',
      '  PASS a passing step',
      '  SKIP a step skipped in BeforeStep',
      '  PASS the next step runs',
    ].join('\n'),
  );
  expect(getSkipReasons(messages)).toEqual(['Skipped in BeforeStep']);
});

test(`${testDir.name} (skip outside of step)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    '$step.skip() can only be called inside a step or a step hook.',
    { env: { FEATURE: 'skip-outside-of-step' } },
  );
});

test(`${testDir.name} (older Playwright)`, { skip: hasStepSkip }, () => {
  execPlaywrightTestWithError(testDir.name, '$step.skip() requires Playwright 1.51 or newer.', {
    env: { FEATURE: 'skip-in-step' },
  });
});

function runFeature(feature) {
  testDir.clearDir(`actual-reports/${feature}`);
  return execPlaywrightTest(testDir.name, { env: { FEATURE: feature } });
}

function getMessages(feature) {
  return getMessagesFromFile(testDir.getAbsPath(`actual-reports/${feature}/messages.ndjson`));
}

function getSkipReasons(messages) {
  return messages
    .filter((m) => m.testStepFinished?.testStepResult.status === 'SKIPPED')
    .map((m) => m.testStepFinished.testStepResult.message);
}
