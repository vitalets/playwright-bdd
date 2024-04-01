import { test, getTestName, execPlaywrightTest } from '../_helpers/index.mjs';

test(getTestName(import.meta), (t) => {
  execPlaywrightTest(t.name);
});
