import { test, getTestName, execPlaywrightTestWithError } from '../_helpers/index.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, `Can't find Playwright config file in`),
);
