import { test, getTestName, execPlaywrightTest, getPlaywrightVersion } from '../helpers.mjs';

const isPW133 = getPlaywrightVersion().startsWith('1.33.');

test(getTestName(import.meta), { skip: isPW133 }, (t) => {
  execPlaywrightTest(t.name);
});
