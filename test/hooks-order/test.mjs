import { test, expect, TestDir, execPlaywrightTest, DEFAULT_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (1 worker)`, () => {
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

test(`${testDir.name} (2 workers)`, () => {
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

function expectCalls(prefix, stdout, expectedCalls) {
  const calls = stdout.split('\n').filter((line) => line.startsWith(prefix));

  expect(calls).toEqual(expectedCalls.map((call) => prefix + call));
}
