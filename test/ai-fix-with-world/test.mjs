/**
 * See: https://github.com/vitalets/playwright-bdd/issues/319
 */
import { test, TestDir, playwrightVersion, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// Aria snapshots appeared in Playwright 1.49
const skip = playwrightVersion < '1.49.0';

test(testDir.name, { skip }, async () => {
  execPlaywrightTest(testDir.name);
});
