import {
  test,
  expectCalls,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (simple)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    env: { FEATURE: 'simple' },
  });

  expectCalls('worker 0: ', stdout, [
    // scenario 1
    'testFixtureCommon setup',

    'BeforeStep 1',
    'BeforeStep 2',
    'step 1',
    'AfterStep 2',
    'AfterStep 1',

    'BeforeStep 1',
    'BeforeStep 2',
    'step 2',
    'AfterStep 2',
    'AfterStep 1',

    // scenario 2
    'testFixtureCommon setup',
    'testFixtureScenario2 setup',

    'BeforeStep 1',
    'BeforeStep 2',
    'BeforeStep 3 (@scenario2)',
    'step 3',
    'AfterStep 3 (@scenario2)',
    'AfterStep 2',
    'AfterStep 1',

    'BeforeStep 1',
    'BeforeStep 2',
    'BeforeStep 3 (@scenario2)',
    'step 4',
    'AfterStep 3 (@scenario2)',
    'AfterStep 2',
    'AfterStep 1',
  ]);
});

test(`${testDir.name} (with bg)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    env: { FEATURE: 'with-bg' },
  });

  expectCalls('worker 0: ', stdout, [
    'testFixtureCommon setup',

    'BeforeStep 1',
    'BeforeStep 2',
    'bg step of scenario 1',
    'AfterStep 2',
    'AfterStep 1',

    'BeforeStep 1',
    'BeforeStep 2',
    'step 1',
    'AfterStep 2',
    'AfterStep 1',
  ]);
});

test(`${testDir.name} (decorators)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    env: { FEATURE: 'decorators' },
  });

  expectCalls('worker 0: ', stdout, [
    'testFixtureCommon setup',

    'BeforeStep 1',
    'BeforeStep 2',
    'decorator step 1',
    'AfterStep 2',
    'AfterStep 1',

    'BeforeStep 1',
    'BeforeStep 2',
    'decorator step 2',
    'AfterStep 2',
    'AfterStep 1',
  ]);
});

test(`${testDir.name} (error)`, () => {
  const stdout = execPlaywrightTestWithError(testDir.name, '', {
    env: { FEATURE: 'error' },
  });

  expectCalls('worker 0: ', stdout, [
    // scenario 1
    'testFixtureCommon setup',

    'BeforeStep 1',
    'BeforeStep with error',
  ]);

  expectCalls('worker 1: ', stdout, [
    // scenario 2
    'testFixtureCommon setup',

    'BeforeStep 1',
    'BeforeStep 2',
    'step 3',
    'AfterStep 2',
    'AfterStep with error',
    'AfterStep 1',
  ]);
});
