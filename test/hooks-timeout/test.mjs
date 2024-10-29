import {
  test,
  expect,
  expectCalls,
  TestDir,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test('timeout in beforeAll', () => {
  const stdout = execPlaywrightWithTimeoutInHook('BeforeAll 1');
  // no other BeforeAll hooks called, all AfterAll hooks called
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1', // prettier-ignore
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

test('timeout in before', () => {
  const stdout = execPlaywrightWithTimeoutInHook('Before 1');
  // no more before hooks called, but all after / afterAll hooks called
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

test('timeout in after', () => {
  const stdout = execPlaywrightWithTimeoutInHook('After 2');
  // all other after / afterAll hooks called
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 1',
    'Before 2 scenario 1',
    'Step scenario 1',
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
    'Step scenario 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

test('error in afterAll', () => {
  const stdout = execPlaywrightWithTimeoutInHook('AfterAll 2');
  // in cucumber: no other AfterAll hooks called
  // in pw: all other AfterAll hooks called <-- we use this in pw-bdd
  expectCalls('worker 0: ', stdout, [
    'BeforeAll 1',
    'BeforeAll 2',
    'Before 1 scenario 1',
    'Before 2 scenario 1',
    'Step scenario 1',
    'After 2 scenario 1',
    'After 1 scenario 1',
    'Before 1 scenario 2',
    'Before 2 scenario 2',
    'Step scenario 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2',
    'AfterAll 1',
  ]);
});

function execPlaywrightWithTimeoutInHook(hook) {
  const stdout = execPlaywrightTestWithError(testDir.name, ``, {
    env: { TIMEOUT: hook },
  });
  expect(stdout).toContain('hook timeout (5 ms)');
  return stdout;
}
