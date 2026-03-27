import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTestWithError(testDir.name);

  testDir.assertJsonReport(`actual-reports/json-report.json`, `expected-reports/json-report.json`);
});
