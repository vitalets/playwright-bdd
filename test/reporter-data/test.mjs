import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  checkStepsTree();
});

function checkStepsTree() {
  const expectedTree = testDir.getFileContents('expected-reports/report.txt');
  const actualTree = testDir.getFileContents('actual-reports/report.txt');
  expect(actualTree).toEqual(expectedTree);
}
