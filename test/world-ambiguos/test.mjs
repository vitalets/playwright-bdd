import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (only-steps)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'All steps and hooks in a feature file should have the same worldFixture',
      'Found fixtures: world1, world2',
    ],
    { env: { FEATURES_ROOT: 'only-steps' } },
  );
});

test(`${testDir.name} (scenario-hooks)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'All steps and hooks in a feature file should have the same worldFixture',
      'Found fixtures: world1, world2',
    ],
    { env: { FEATURES_ROOT: 'scenario-hooks' } },
  );
});
