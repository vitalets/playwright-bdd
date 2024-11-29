import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(testDir.name, [
    'All steps in a feature file should have the same worldFixture',
    'Found fixtures: world1, world2',
  ]);
});
