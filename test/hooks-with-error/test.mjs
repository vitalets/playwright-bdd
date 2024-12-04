import { test, expectCalls, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

function execPlaywrightWithErrorInHook(hook) {
  return execPlaywrightTestWithError(testDir.name, ``, {
    env: { ERROR: hook },
  });
}

test(`${testDir.name} (BeforeAll)`, () => {
  const stdout = execPlaywrightWithErrorInHook('BeforeAll 1');

  // no other beforeAll hooks called
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1', // prettier-ignore
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

test(`${testDir.name} (Before)`, () => {
  const stdout = execPlaywrightWithErrorInHook('Before 1');

  // no other before hooks called, but all after / afterAll hooks called
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 1',
    'After 2 scenario 1',
    'After 1 scenario 1',
    'AfterAll 2',
    'AfterAll 1',
  ]);
  expectCalls('worker 1: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

test(`${testDir.name} (After)`, () => {
  const stdout = execPlaywrightWithErrorInHook('After 2');

  // all other after / afterAll hooks called
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

test(`${testDir.name} (afterAll)`, () => {
  const stdout = execPlaywrightWithErrorInHook('AfterAll 2');

  // in cucumber: no other AfterAll hooks called
  // in pw: all other AfterAll hooks called <-- we use this in pw-bdd
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
