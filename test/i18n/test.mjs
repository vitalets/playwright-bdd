import { test, getTestName, execPlaywrightTest, TestDir, BDDGEN_CMD } from '../_helpers/index.mjs';
import { expect } from '@playwright/test';

const testDir = new TestDir(import.meta);
test(getTestName(import.meta), (t) => execPlaywrightTest(t.name));

test(testDir.name + '-generate-scenario-outlines', () => {
  const outputDir = testDir.getAbsPath('.features-gen');
  testDir.clearDir(outputDir);

  execPlaywrightTest(testDir.name, `${BDDGEN_CMD} --tags "@outline"`);

  checkGeneratedSpecFile();
  checkHtmlReport();
});

function checkGeneratedSpecFile() {
  const fileContents = testDir.getFileContents('.features-gen/sample.feature.spec.js');
  expect(fileContents).toContain(`test.describe("русский язык"`);
  expect(fileContents).toContain(`test.describe("русский сценарий 2"`);
  expect(fileContents).not.toContain(`test("русский сценарий 2"`);
  expect(fileContents).toContain(`test("Example #1",`);
  expect(fileContents).toContain(`test("Example #2",`);
}

function checkHtmlReport() {
  expect(testDir.getFileContents('reports/report.html')).toContain('Сценарий');
}
