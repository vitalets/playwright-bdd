/**
 * Playwright oficcially does not support decorators in JavaScript:
 * See: https://github.com/microsoft/playwright/issues/29646#issuecomment-1967476543
 *
 * However, users want to use decorators in JavaScript files.
 * Use-case: building POM steps library:
 * See: https://github.com/vitalets/playwright-bdd/issues/352
 *
 * The current workaround is to use non-public field in the Playwright config to enable decorators.
 * See: https://github.com/microsoft/playwright/issues/29646#issuecomment-3569047343
 *
 * This test checks that decorators work in JavaScript files with this workaround.
 */
import {
  test,
  TestDir,
  execPlaywrightTest,
  BDDGEN_CMD,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// Playwright 1.63 removed the non-public babelPlugins config field used by this test.
// See: https://github.com/microsoft/playwright/pull/42168/changes#diff-54b00098ad68ce7aa9e7f03bb69e87b19412ed58f2624d8e5bfa4f5f4867836aL119
const skip = playwrightVersion >= '1.63';

test(testDir.name, { skip }, () => {
  execPlaywrightTest(testDir.name, BDDGEN_CMD);
});
