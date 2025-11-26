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
import { test, TestDir, execPlaywrightTest, BDDGEN_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name, BDDGEN_CMD);
});
