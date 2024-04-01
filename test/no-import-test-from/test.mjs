import { test, getTestName, execPlaywrightTestWithError } from '../_helpers/index.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(
    t.name,
    `When using custom "test" function in createBdd() you should`,
  ),
);
