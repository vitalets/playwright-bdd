import { test, TestDir, execPlaywrightTest, BDDGEN_CMD, expect } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => execPlaywrightTest(testDir.name));

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
