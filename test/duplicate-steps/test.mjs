import {
  test,
  TestDir,
  normalize,
  execPlaywrightTestWithError,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const featureFile = normalize('features/sample.feature');

test(`${testDir.name} (main thread - regular steps)`, () => {
  const error = [
    `Multiple step definitions matched for text: "duplicate step" (${featureFile})`,
    `  duplicate step - steps/steps.ts:6`,
    `  duplicate step - steps/steps.ts:7`,
    `  duplicate step - steps/steps.ts:8`,
  ].join('\n');
  execPlaywrightTestWithError(testDir.name, error, {
    cmd: BDDGEN_CMD,
    env: { PROJECTS: 'duplicate-regular-steps' },
  });
});

test(`${testDir.name} (main thread - decorator steps)`, () => {
  const error = [
    `Multiple step definitions matched for text: "duplicate decorator step" (${featureFile})`,
    `  duplicate decorator step - steps/TodoPage.ts:7`,
    `  duplicate decorator step - steps/TodoPage.ts:10`,
    `  duplicate decorator step - steps/TodoPage.ts:13`,
  ].join('\n');
  execPlaywrightTestWithError(testDir.name, error, {
    cmd: BDDGEN_CMD,
    env: { PROJECTS: 'duplicate-decorator-steps' },
  });
});

test(`${testDir.name} (worker - regular steps)`, () => {
  const error = [
    `Multiple step definitions matched for text: "duplicate step" (${featureFile})`,
    `  duplicate step - steps/steps.ts:6`,
    `  duplicate step - steps/steps.ts:7`,
    `  duplicate step - steps/steps.ts:8`,
  ].join('\n');
  execPlaywrightTestWithError(testDir.name, error, {
    cmd: BDDGEN_CMD,
    env: { PROJECTS: 'no-duplicates,duplicate-regular-steps' },
  });
});
