import {
  test,
  TestDir,
  normalize,
  execPlaywrightTestWithError,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (main thread - regular steps)`, () => {
  const error = [
    `Multiple step definitions found`,
    `Step: Given duplicate step`,
    `File: ${normalize('features/sample.feature:5:5')}`,
    `  - Given 'duplicate step' # ${normalize('steps/steps.ts')}:6`,
    `  - Given 'duplicate step' # ${normalize('steps/steps.ts')}:7`,
    `  - Given 'duplicate step' # ${normalize('steps/steps.ts')}:8`,
  ];
  execPlaywrightTestWithError(testDir.name, error, {
    cmd: BDDGEN_CMD,
    env: { PROJECTS: 'duplicate-regular-steps' },
  });
});

test(`${testDir.name} (main thread - decorator steps)`, () => {
  const error = [
    `Multiple step definitions found`,
    `Step: Given duplicate decorator step`,
    `File: ${normalize('features/sample.feature:9:5')}`,
    `  - Given 'duplicate decorator step' # ${normalize('steps/TodoPage.ts')}:7`,
    `  - Given 'duplicate decorator step' # ${normalize('steps/TodoPage.ts')}:10`,
    `  - Given 'duplicate decorator step' # ${normalize('steps/TodoPage.ts')}:13`,
  ];
  execPlaywrightTestWithError(testDir.name, error, {
    cmd: BDDGEN_CMD,
    env: { PROJECTS: 'duplicate-decorator-steps' },
  });
});

test(`${testDir.name} (worker - regular steps)`, () => {
  const error = [
    `Multiple step definitions found`,
    `Step: Given duplicate step`,
    `File: ${normalize('features/sample.feature:5:5')}`,
    `  - Given 'duplicate step' # ${normalize('steps/steps.ts')}:6`,
    `  - Given 'duplicate step' # ${normalize('steps/steps.ts')}:7`,
    `  - Given 'duplicate step' # ${normalize('steps/steps.ts')}:8`,
  ];
  execPlaywrightTestWithError(testDir.name, error, {
    cmd: BDDGEN_CMD,
    env: { PROJECTS: 'no-duplicates,duplicate-regular-steps' },
  });
});
