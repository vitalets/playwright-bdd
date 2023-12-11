import { normalize } from 'node:path';
import { test, TestDir, execPlaywrightTestWithError, DEFAULT_CMD } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (main thread)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    DUPLICATE_STEPS_ERROR,
    `${DEFAULT_CMD} --project duplicates`,
  );
});

test(`${testDir.name} (worker)`, () => {
  execPlaywrightTestWithError(testDir.name, DUPLICATE_STEPS_ERROR);
});

const DUPLICATE_STEPS_ERROR = [
  `Multiple step definitions matched for text: "duplicate step" (${normalize(
    'features/two.feature',
  )})`,
  '  duplicate step',
  '  duplicate step',
].join('\n');
