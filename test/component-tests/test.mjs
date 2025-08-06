import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

/*
Currently Playwright-BDD actually does not support component tests.
Two main limitations:
1. Need to register all components to be bundled for client-side.
2. Need to cleanup all non-js imports from steps, as Node.js can't handle them.

Only simple no-asset components are supported that is useless for real life tests.
*/

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name);
});
