/**
 * When a scenario fails and is retried, Playwright re-runs it in a new worker where BeforeAll
 * executes again (credited to attempt 1). TestCase.addHooks() then adds BeforeAll to the shared
 * TestCase, making it appear in attempt 0's messages too — even though BeforeAll in worker 1 was
 * credited to scenario A (the first scenario). The fix: emit SKIPPED (not PASSED/duration=0) for
 * any hook that has no matching pwStep in the current attempt, clearly indicating it did not run
 * as part of that specific attempt.
 */
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';
import { getMessagesFromFile } from '../_helpers/reports/messages.mjs';
import { formatMessagesReport } from '../_helpers/reports/messages-formatter.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  assertReport();
});

function assertReport() {
  const messages = getMessagesFromFile(testDir.getAbsPath('actual-reports/messages.ndjson'));

  expect(formatMessagesReport(messages)).toEqual(
    [
      'Scenario: scenario that always passes [attempt 0]',
      '  PASS setup all',
      '  PASS a step that passes',
      'Scenario: scenario that fails first time [attempt 0]',
      '  SKIP setup all', // BeforeAll SKIPPED — ran in worker 1 but credited to scenario A, not B
      '  FAIL a step that passes the second time',
      '  PASS After Hooks',
      'Scenario: scenario that fails first time [attempt 1]',
      '  PASS setup all',
      '  PASS a step that passes the second time',
      '  SKIP After Hooks', // AfterAll SKIPPED — PW omits Worker Cleanup for passing tests (microsoft/playwright#38350)
    ].join('\n'),
  );
}
