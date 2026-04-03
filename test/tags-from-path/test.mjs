import { test, TestDir, execPlaywrightTest, expectCalls } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (1 worker)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 1 } });

  expectCalls('worker 0: ', stdout, [
    'BeforeWorker 1',
    'BeforeScenario 1',
    'BeforeStep 1',
    'scenario 1: a shared step',
    'AfterStep 1',
    'BeforeStep 1',
    'scenario 1: a step',
    'AfterStep 1',
    'AfterScenario 1',
    'BeforeWorker 2',
    'BeforeScenario 2',
    'BeforeStep 2',
    'scenario 2: a shared step',
    'AfterStep 2',
    'BeforeStep 2',
    'scenario 2: a step',
    'AfterStep 2',
    'AfterScenario 2',
    'AfterWorker 2',
    'AfterWorker 1',
  ]);
});

test(`${testDir.name} (2 workers)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { WORKERS: 2 } });

  expectCalls('worker 0: ', stdout, [
    'BeforeWorker 1',
    'BeforeScenario 1',
    'BeforeStep 1',
    'scenario 1: a shared step',
    'AfterStep 1',
    'BeforeStep 1',
    'scenario 1: a step',
    'AfterStep 1',
    'AfterScenario 1',
    'AfterWorker 1',
  ]);

  expectCalls('worker 1: ', stdout, [
    'BeforeWorker 2',
    'BeforeScenario 2',
    'BeforeStep 2',
    'scenario 2: a shared step',
    'AfterStep 2',
    'BeforeStep 2',
    'scenario 2: a step',
    'AfterStep 2',
    'AfterScenario 2',
    'AfterWorker 2',
  ]);
});
