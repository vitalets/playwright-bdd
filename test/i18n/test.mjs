import { test, TestDir, execPlaywrightTest, expect } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name);

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
  expect(testDir.getFileContents('actual-reports/report.html')).toContain('Сценарий');
}
