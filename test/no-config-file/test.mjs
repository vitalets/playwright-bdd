import { test, getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, `Can't find Playwright config file in`),
);
