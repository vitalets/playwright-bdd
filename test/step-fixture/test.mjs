import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// $step.attach() and $step.info.attach() are covered in reporter-cucumber-html.
// Detailed $step.skip() behavior is covered in step-skip.
test(testDir.name, () => execPlaywrightTest(testDir.name));
