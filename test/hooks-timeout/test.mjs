import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test('timeout in beforeAll: no other hooks called, process exit', () => {
  const stdout = execPlaywrightWithTimeoutInHook('BeforeAll 1');
  expectHookCalls(stdout, ['BeforeAll 1 worker 0']);
  expect(stdout).not.toContain('AfterAll');
});

test('timeout in before: no more before hooks called, but all after / afterAll hooks called', () => {
  const stdout = execPlaywrightWithTimeoutInHook('Before 1');
  expectHookCalls(stdout, [
    'BeforeAll 1 worker 0',
    'BeforeAll 2 worker 0',
    'Before 1 scenario 1',
    'After 2 scenario 1',
    'After 1 scenario 1',
    'AfterAll 2 worker 0',
    'AfterAll 1 worker 0',
  ]);
  expectHookCalls(stdout, [
    'BeforeAll 1 worker 1',
    'BeforeAll 2 worker 1',
    'Before 1 scenario 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2 worker 1',
    'AfterAll 1 worker 1',
  ]);
});

test('timeout in after: all other after / afterAll hooks called', () => {
  const stdout = execPlaywrightWithTimeoutInHook('After 2');
  expectHookCalls(stdout, [
    'BeforeAll 1 worker 0',
    'BeforeAll 2 worker 0',
    'Before 1 scenario 1',
    'Before 2 scenario 1',
    'Step scenario 1',
    'After 2 scenario 1',
    'After 1 scenario 1',
    'AfterAll 2 worker 0',
    'AfterAll 1 worker 0',
  ]);
  expectHookCalls(stdout, [
    'BeforeAll 1 worker 1',
    'BeforeAll 2 worker 1',
    'Before 1 scenario 2',
    'Before 2 scenario 2',
    'Step scenario 2',
    'After 2 scenario 2',
    'After 1 scenario 2',
    'AfterAll 2 worker 1',
    'AfterAll 1 worker 1',
  ]);
});

// in cucumber: no other AfterAll hooks called
// in pw: all other AfterAll hooks called <-- we use this in pw-bdd
test('error in afterAll: all other AfterAll hooks called', () => {
  const stdout = execPlaywrightWithTimeoutInHook('AfterAll 2');
  expectHookCalls(stdout, [
    'BeforeAll 1 worker 0',
    'BeforeAll 2 worker 0',
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
    'AfterAll 2 worker 0',
    'AfterAll 1 worker 0',
  ]);
});

function execPlaywrightWithTimeoutInHook(hook) {
  const stdout = execPlaywrightTestWithError(testDir.name, ``, {
    env: { TIMEOUT: hook },
  });
  expect(stdout).toContain('hook timeout (5 ms)');
  return stdout;
}

function expectHookCalls(stdout, hookCalls) {
  expect(stdout).toContain(['Start', ...hookCalls, 'End'].join('\n'));
}
