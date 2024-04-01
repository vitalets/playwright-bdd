import { test, getTestName, execPlaywrightTestWithError } from '../_helpers/index.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, [
    `Parse error in "sample.feature" (1:1)`,
    `got 'Feature123: Playwright site'`,
  ]),
);
