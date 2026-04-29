import {
  test,
  TestDir,
  normalize,
  execPlaywrightTestWithError,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (playwright style)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'Found step definitions with incorrect arguments: 4',
      // missing args for expression step
      `Step: Given pw step with missing args 42 # ${normalize('features/playwright-style/sample.feature:4:5')}`,
      `Definition: Given 'pw step with missing args {int}' # ${normalize('features/playwright-style/steps.ts:3')}`,
      'Function has 1 arguments, but expected 2.',
      // missing args for doc string step
      `Step: Given pw doc step with missing args # ${normalize('features/playwright-style/sample.feature:7:5')}`,
      `Definition: Given 'pw doc step with missing args' # ${normalize('features/playwright-style/steps.ts:4')}`,
      'Function has 1 arguments, but expected 2.',
      // too many args for expression step
      `Step: Given pw step with too many args 42 # ${normalize('features/playwright-style/sample.feature:13:5')}`,
      `Definition: Given 'pw step with too many args {int}' # ${normalize('features/playwright-style/steps.ts:5')}`,
      'Function has 3 arguments, but expected 2.',
      // too many args for doc string step
      `Step: Given pw doc step with too many args # ${normalize('features/playwright-style/sample.feature:16:5')}`,
      `Definition: Given 'pw doc step with too many args' # ${normalize('features/playwright-style/steps.ts:6')}`,
      'Function has 3 arguments, but expected 2.',
    ],
    { cmd: BDDGEN_CMD, env: { FEATURES_DIR: 'playwright-style' } },
  );
});

test(`${testDir.name} (cucumber style)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'Found step definitions with incorrect arguments: 4',
      // missing args for expression step
      `Step: Given cucumber step with missing args 42 # ${normalize('features/cucumber-style/sample.feature:4:5')}`,
      `Definition: Given 'cucumber step with missing args {int}' # ${normalize('features/cucumber-style/steps.ts:3')}`,
      'Function has 0 arguments, but expected 1.',
      // missing args for doc string step
      `Step: Given cucumber doc step with missing args # ${normalize('features/cucumber-style/sample.feature:7:5')}`,
      `Definition: Given 'cucumber doc step with missing args' # ${normalize('features/cucumber-style/steps.ts:4')}`,
      'Function has 0 arguments, but expected 1.',
      // too many args for expression step
      `Step: Given cucumber step with too many args 42 # ${normalize('features/cucumber-style/sample.feature:13:5')}`,
      `Definition: Given 'cucumber step with too many args {int}' # ${normalize('features/cucumber-style/steps.ts:5')}`,
      'Function has 2 arguments, but expected 1.',
      // too many args for doc string step
      `Step: Given cucumber doc step with too many args # ${normalize('features/cucumber-style/sample.feature:16:5')}`,
      `Definition: Given 'cucumber doc step with too many args' # ${normalize('features/cucumber-style/steps.ts:6')}`,
      'Function has 2 arguments, but expected 1.',
    ],
    { cmd: BDDGEN_CMD, env: { FEATURES_DIR: 'cucumber-style' } },
  );
});

test(`${testDir.name} (decorator style)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'Found step definitions with incorrect arguments: 4',
      // missing args for expression step
      `Step: Given decorator step with missing args 42 # ${normalize('features/decorator-style/sample.feature:4:5')}`,
      `Definition: Given 'decorator step with missing args {int}' # ${normalize('features/decorator-style/steps.ts:7')}`,
      'Function has 0 arguments, but expected 1.',
      // missing args for doc string step
      `Step: Given decorator doc step with missing args # ${normalize('features/decorator-style/sample.feature:7:5')}`,
      `Definition: Given 'decorator doc step with missing args' # ${normalize('features/decorator-style/steps.ts:10')}`,
      'Function has 0 arguments, but expected 1.',
      // too many args for expression step
      `Step: Given decorator step with too many args 42 # ${normalize('features/decorator-style/sample.feature:13:5')}`,
      `Definition: Given 'decorator step with too many args {int}' # ${normalize('features/decorator-style/steps.ts:13')}`,
      'Function has 2 arguments, but expected 1.',
      // too many args for doc string step
      `Step: Given decorator doc step with too many args # ${normalize('features/decorator-style/sample.feature:16:5')}`,
      `Definition: Given 'decorator doc step with too many args' # ${normalize('features/decorator-style/steps.ts:16')}`,
      'Function has 2 arguments, but expected 1.',
    ],
    { cmd: BDDGEN_CMD, env: { FEATURES_DIR: 'decorator-style' } },
  );
});
