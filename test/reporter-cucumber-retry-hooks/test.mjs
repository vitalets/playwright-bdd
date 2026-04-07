/**
 * Bug: when a scenario fails and is retried, BeforeAll hooks from the retry attempt
 * (attempt 1) leak into the TestCase and appear in attempt 0's messages with
 * duration=0. Attempt 0 ran in a worker where BeforeAll was credited to the *first*
 * scenario (scenario A), so attempt 0 has no BeforeAll pwStep in its result.
 *
 * Expected: attempt 0 should NOT include BeforeAll in its messages (it was not
 * captured in that test result). Currently it appears as PASSED / duration=0.
 */
import { expect } from '@playwright/test';
import { jsonPaths } from 'json-paths';
import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';
import { DEFAULT_RULES, getMessagesFromFile } from '../_helpers/reports/messages.mjs';

const testDir = new TestDir(import.meta);

test.skip(testDir.name, () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  assertReport();
});

function assertReport() {
  const messages = getMessagesFromFile(testDir.getAbsPath('actual-reports/messages.ndjson'));
  const actualShape = jsonPaths(messages, DEFAULT_RULES);
  expect(actualShape).toMatchObject({
    // Scenario B's testCase should NOT include BeforeAll hookId (credited to scenario A).
    // Expected: 2 (A: BeforeAll, B: AfterAll). Bug: 3 (B also gets leaked BeforeAll).
    'testCase.testSteps.#.hookId': 2,
    'testCaseStarted.attempt': { 0: 2, 1: 1 },
    // Attempt 0 of B should NOT emit a BeforeAll step.
    // Expected: 7 (A:2, B-attempt0:2, B-attempt1:3). Bug: 8 (extra spurious BeforeAll in attempt 0).
    'testStepStarted.testStepId': 7,
    // Expected: 6 PASSED. Bug: 7 PASSED (extra spurious PASSED from leaked BeforeAll in attempt 0).
    'testStepFinished.testStepResult.status': { PASSED: 6, FAILED: 1 },
  });
}
