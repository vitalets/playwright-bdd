import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { test, execPlaywrightTest, TestDir, BDDGEN_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const outputDir = testDir.getAbsPath('.features-gen');
  testDir.clearDir(outputDir);

  // create file in .features-gen to ensure that it is cleared
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const fileToBeCleared = '.features-gen/foo.spec.js';
  fs.writeFileSync(testDir.getAbsPath(fileToBeCleared), '');

  execPlaywrightTest(testDir.name, `${BDDGEN_CMD} --tags "@include and not @exclude"`);

  // important to keep included files in separate directory (subdir)
  // to ensure that directory structure kept the same when running with tags

  testDir.getAllFiles('features').forEach((relativePath) => {
    const outputFilePath = path.join('.features-gen/features', `${relativePath}.spec.js`);
    const fileName = path.basename(relativePath);
    const shouldExist = !fileName.startsWith('skip');
    const message = `File: ${outputFilePath} expected to ${shouldExist ? 'exist' : 'not exist'}`;
    // use assert as playwright's expect does not show custom message for some reason
    assert(testDir.isFileExists(outputFilePath) === shouldExist, message);
  });

  let fileContents = testDir.getFileContents(
    '.features-gen/features/subdir/include.feature.spec.js',
  );
  expect(fileContents).toContain(`test("scenario 1",`);
  expect(fileContents).not.toContain(`test("scenario 2",`);

  fileContents = testDir.getFileContents('.features-gen/features/subdir/outline.feature.spec.js');
  expect(fileContents).not.toContain(`test("Example #1",`);
  expect(fileContents).not.toContain(`test("Example #2",`);
  expect(fileContents).toContain(`test("Example #3",`);

  expect(testDir.isFileExists(fileToBeCleared)).toEqual(false);
});
