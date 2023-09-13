import { test, getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test.only(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, [
    `Parse error in "sample.feature" (1:1)`,
    `got 'Feature123: Playwright site'`,
  ]),
);
