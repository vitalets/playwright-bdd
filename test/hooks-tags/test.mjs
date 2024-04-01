import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test('hooks tags', () => {
  const stdout = execPlaywrightTest(testDir.name);
  expectHookCalls(stdout, [
    'Before @bar scenario 1',
    'Step scenario 1',
    'After @bar scenario 1',
    'Before @foo and not @bar scenario 2',
    'Step scenario 2',
    'After @foo and not @bar scenario 2',
  ]);
});

function expectHookCalls(stdout, hookCalls) {
  expect(stdout).toContain(['Start', ...hookCalls, 'End'].join('\n'));
}
