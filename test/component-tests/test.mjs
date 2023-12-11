import { test, getTestName, execPlaywrightTest, getPackageVersion } from '../helpers.mjs';

// Playwright 1.33 has a strange error
// See: https://github.com/vitalets/playwright-bdd/pull/63#issuecomment-1782832507
const isPW133 = getPackageVersion('@playwright/test').startsWith('1.33.');

test(getTestName(import.meta), { skip: isPW133 }, (t) => {
  execPlaywrightTest(t.name);
});
