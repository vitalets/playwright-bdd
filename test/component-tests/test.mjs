import { test, getTestName, execPlaywrightTest, getPackageVersion } from '../_helpers/index.mjs';

const pwVersion = getPackageVersion('@playwright/test');

test(getTestName(import.meta), (t) => {
  execPlaywrightTest(t.name, {
    env: {
      NATIVE_MERGE_TESTS: pwVersion >= '1.39.0' ? '1' : '',
    },
  });
});
