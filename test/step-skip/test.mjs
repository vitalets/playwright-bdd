import assert from 'node:assert/strict';
import {
  test,
  TestDir,
  expectCalls,
  execPlaywrightTest,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test('step-skip (body and before hooks)', () => {
  const stdout = execPlaywrightTest(testDir.name);
  expectCalls('worker 0: ', stdout, [
    'unnamed before',
    'named before',
    'body skips',
    'named after',
    'unnamed after',
    'unnamed before',
    'named before',
    'next step',
    'named after',
    'unnamed after',
    'unnamed before',
    'named before',
    'body skips unconditionally',
    'named after',
    'unnamed after',
    'unnamed before',
    'named before',
    'next step',
    'named after',
    'unnamed after',
    'unnamed before gate',
    'unnamed before gate',
    'unnamed before',
    'named before',
    'next step',
    'named after',
    'unnamed after',
    'named before gate',
    'named before gate',
    'unnamed before',
    'named before',
    'next step',
    'named after',
    'unnamed after',
  ]);
  const results = readStepResults();
  assert.equal(results.filter((result) => result.status === 'SKIPPED').length, 4);
  assert.ok(results.some((result) => result.message === 'body reason'));
  assert.equal(results.filter((result) => result.message === 'before reason').length, 2);
  assert.ok(results.every((result) => ['PASSED', 'SKIPPED'].includes(result.status)));
  testDir.expectFileContains('actual-reports/cucumber.json', 'skipped');
  testDir.expectFileContains('actual-reports/cucumber.xml', '<skipped');
});

test('step-skip (after failure beats skip)', () => {
  execPlaywrightTestWithError(testDir.name, 'real after error', {
    env: { FEATURE: 'after-error' },
  });
  const failures = readStepResults().filter((result) => result.status === 'FAILED');
  assert.equal(failures.length, 2);
  assert.ok(failures.every((result) => result.message.includes('real after error')));
});

test('step-skip (reject skip in after hooks)', () => {
  execPlaywrightTestWithError(testDir.name, '$step.skip() cannot be called in AfterStep hooks.', {
    env: { FEATURE: 'after-skip' },
  });
  assert.equal(readStepResults().filter((result) => result.status === 'FAILED').length, 2);
});

function readStepResults() {
  return testDir
    .getFileContents('actual-reports/messages.ndjson')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line).testStepFinished?.testStepResult)
    .filter(Boolean);
}
