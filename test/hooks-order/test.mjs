import { expect } from '@playwright/test';
import {
  test,
  TestDir,
  execPlaywrightTest,
  DEFAULT_CMD,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test('hooks order, 1 worker', () => {
  const stdout = execPlaywrightTest(testDir.name);
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 1',
    'Before 2 scenario 1',
    'Step bg',
    'Step 1',
    'After 2 scenario 1',
    'After 1 scenario 1',
    'Before 1 scenario 2',
    'Before 2 scenario 2',
    'Step bg',
    'Step 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

test('hooks order, 2 workers', () => {
  const stdout = execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --workers=2 --fully-parallel`);

  // worker 0
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 1',
    'Before 2 scenario 1',
    'Step bg',
    'Step 1',
    'After 2 scenario 1',
    'After 1 scenario 1',
    'AfterAll 2',
    'AfterAll 1',
  ]);

  // worker 1
  expectCalls('worker 1: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 2',
    'Before 2 scenario 2',
    'Step bg',
    'Step 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

test('error in beforeAll: no other beforeAll hooks called', () => {
  const stdout = execPlaywrightWithErrorInHook('BeforeAll 1');
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1', // prettier-ignore
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

// PW runs all before* hooks in case of error
// See: https://github.com/microsoft/playwright/issues/28285
test('error in before: no other before hooks called, but all after / afterAll hooks called', () => {
  const stdout = execPlaywrightWithErrorInHook('Before 1');

  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 1',
    'Step bg', // to be removed!
    'After 2 scenario 1',
    'After 1 scenario 1',
    'AfterAll 2',
    'AfterAll 1',
  ]);
  expectCalls('worker 1: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 2',
    'Step bg', // to be removed!
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

test('error in after: all other after / afterAll hooks called', () => {
  const stdout = execPlaywrightWithErrorInHook('After 2');
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 1',
    'Before 2 scenario 1',
    'Step bg',
    'Step 1',
    'After 2 scenario 1',
    'After 1 scenario 1',
    'AfterAll 2',
    'AfterAll 1',
  ]);
  expectCalls('worker 1: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 2',
    'Before 2 scenario 2',
    'Step bg',
    'Step 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

// in cucumber: no other AfterAll hooks called
// in pw: all other AfterAll hooks called <-- we use this in pw-bdd
test('error in afterAll: all other AfterAll hooks called', () => {
  const stdout = execPlaywrightWithErrorInHook('AfterAll 2');
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 1',
    'Before 2 scenario 1',
    'Step bg',
    'Step 1',
    'After 2 scenario 1',
    'After 1 scenario 1',
    'Before 1 scenario 2',
    'Before 2 scenario 2',
    'Step bg',
    'Step 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

function execPlaywrightWithErrorInHook(hook) {
  return execPlaywrightTestWithError(testDir.name, ``, {
    env: { ERROR: hook },
  });
}

function expectCalls(prefix, stdout, expectedCalls) {
  const calls = stdout.split('\n').filter((line) => line.startsWith(prefix));

  expect(calls).toEqual(expectedCalls.map((call) => prefix + call));
}
