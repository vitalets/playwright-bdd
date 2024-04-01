import { test, getTestName, execPlaywrightTestWithError } from '../_helpers/index.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, `please manually provide different "outputDir" option`),
);
