import { test, TestDir, execPlaywrightTest, expectCalls } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (steps-with-tags)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { FEATURES_ROOT: 'steps-with-tags' } });

  expectCalls('worker 0: ', stdout, [
    'scenario 1: step with @scenario1',
    'scenario 2: step with @scenario2',
  ]);
});

test(`${testDir.name} (scenario-hooks)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { FEATURES_ROOT: 'scenario-hooks' } });

  expectCalls('worker 0: ', stdout, [
    'BeforeScenario',
    'scenario 1: a step',
    'AfterScenario',
    'scenario 2: a step',
  ]);
});

test(`${testDir.name} (worker-hooks)`, () => {
  const stdout = execPlaywrightTest(testDir.name, { env: { FEATURES_ROOT: 'worker-hooks' } });

  expectCalls('worker 0: ', stdout, [
    'BeforeWorker', // prettier-ignore
    'scenario 1: a step',
    'AfterWorker',
  ]);

  expectCalls('worker 1: ', stdout, [
    'scenario 2: a step', // prettier-ignore
  ]);
});
