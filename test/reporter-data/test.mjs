import {
  test,
  expect,
  TestDir,
  execPlaywrightTest,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

function getExpectedReportName() {
  switch (true) {
    // Since PW 1.50 each step has 'attachments' field, no 'attach' type steps in test result.
    case playwrightVersion < '1.50':
      return 'report-less-1.50.txt';
    // Since pw 1.53 'page.goto("about:blank")' step title is replaced with 'Navigate "about:blank"'
    case playwrightVersion < '1.53':
      return 'report-less-1.53.txt';
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
