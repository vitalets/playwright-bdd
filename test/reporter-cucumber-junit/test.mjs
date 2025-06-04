import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTestWithError(testDir.name);

  await testDir.assertJunitReport(`actual-reports/junit.xml`, `expected-reports/junit.xml`);
});
