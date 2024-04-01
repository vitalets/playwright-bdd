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

test('hooks order, 2 workers', () => {
  const stdout = execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --workers=2 --fully-parallel`);

  // worker 0
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

  // worker 1
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

test('error in beforeAll: no other hooks called, process exit', () => {
  const stdout = execPlaywrightWithErrorInHook('BeforeAll 1');
  expectHookCalls(stdout, ['BeforeAll 1 worker 0']);
  expect(stdout).not.toContain('AfterAll');
});

test('error in before: no more before hooks called, but all after / afterAll hooks called', () => {
  const stdout = execPlaywrightWithErrorInHook('Before 1');
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

test('error in after: all other after / afterAll hooks called', () => {
  const stdout = execPlaywrightWithErrorInHook('After 2');
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
  const stdout = execPlaywrightWithErrorInHook('AfterAll 2');
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

function execPlaywrightWithErrorInHook(hook) {
  return execPlaywrightTestWithError(testDir.name, ``, {
    env: { ERROR: hook },
  });
}

function expectHookCalls(stdout, hookCalls) {
  expect(stdout).toContain(['Start', ...hookCalls, 'End'].join('\n'));
}
