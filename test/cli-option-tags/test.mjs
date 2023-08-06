// import { expect } from '@playwright/test';
import {
  test,
  getTestName,
  execPlaywrightTest,
  expectFileExists,
  expectFileNotExists,
  clearDir,
} from '../helpers.mjs';

test.skip(getTestName(import.meta), (t) => {
  clearDir(import.meta, '.features-gen');
  execPlaywrightTest(
    t.name,
    'node ../../dist/cli --tags "@include and not @exclude" && npx playwright test',
  );
  expectFileNotExists(import.meta, '.features-gen/skip.feature.spec.js');
  expectFileExists(import.meta, '.features-gen/include.feature.spec.js');
  // expect(stdout).toContain('passed');
});
