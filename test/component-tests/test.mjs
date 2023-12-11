import { test, getTestName, execPlaywrightTest, getPackageVersion } from '../helpers.mjs';

const pwVersion = getPackageVersion('@playwright/test');

// Playwright 1.33 has a weird error.
// See: https://github.com/vitalets/playwright-bdd/pull/63#issuecomment-1782832507
const skip = pwVersion.startsWith('1.33.');

test(getTestName(import.meta), { skip }, (t) => {
  execPlaywrightTest(t.name, {
    NATIVE_MERGE_TESTS: pwVersion >= '1.39.0',
  });
});
