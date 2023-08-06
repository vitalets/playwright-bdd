import { expect } from '@playwright/test';
import { test, execPlaywrightTest, TestDir } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('.features-gen');
  execPlaywrightTest(
    testDir.name,
    'node ../../dist/cli --tags "@include and not @exclude" && npx playwright test',
  );
  expect(testDir.isFileExists('.features-gen/skip-no-tags.feature.spec.js')).toEqual(false);
  expect(testDir.isFileExists('.features-gen/skip-by-top-tag.feature.spec.js')).toEqual(false);

  expect(testDir.isFileExists('.features-gen/include.feature.spec.js')).toEqual(true);
  let fileContents = testDir.getFileContents('.features-gen/include.feature.spec.js');
  expect(fileContents).toContain(`test("scenario 1",`);
  expect(fileContents).not.toContain(`test("scenario 2",`);

  expect(testDir.isFileExists('.features-gen/outline.feature.spec.js')).toEqual(true);
  fileContents = testDir.getFileContents('.features-gen/outline.feature.spec.js');
  expect(fileContents).not.toContain(`test("Example #1",`);
  expect(fileContents).not.toContain(`test("Example #2",`);
  expect(fileContents).toContain(`test("Example #3",`);
});
