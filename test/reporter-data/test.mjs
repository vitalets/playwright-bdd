import {
  test,
  expect,
  TestDir,
  execPlaywrightTest,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// - Since PW 1.46 there is a 'box' option for the fixture, that hides it from the report.
// - Since PW 1.50 each step has 'attahcments' field, no 'attach' type steps in test result.
function getExpectedReportName() {
  switch (true) {
    case playwrightVersion < '1.46':
      return 'report-less-1.46.txt';
    case playwrightVersion < '1.50':
      return 'report-less-1.50.txt';
    default:
      return 'report-current.txt';
  }
}

test(testDir.name, () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  checkStepsTree();
});

function checkStepsTree() {
  const expectedTree = testDir.getFileContents(`expected-reports/${getExpectedReportName()}`);
  const actualTree = testDir.getFileContents('actual-reports/report.txt');
  expect(normalizeCRLF(actualTree)).toEqual(normalizeCRLF(expectedTree));
}

function normalizeCRLF(text) {
  return text.replace(/\r\n/g, '\n');
}
