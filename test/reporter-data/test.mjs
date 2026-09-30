import {
  test,
  expect,
  TestDir,
  execPlaywrightTest,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

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

function getExpectedReportName() {
  switch (true) {
    // Since pw 1.53 'page.goto("about:blank")' step title is replaced with 'Navigate "about:blank"'
    case playwrightVersion < '1.53':
      return 'report-less-1.53.txt';
    // Since PW 1.63 the navigation URL is moved from the step title to its subtitle.
    case playwrightVersion < '1.63':
      return 'report-less-1.63.txt';
    default:
      return 'report-current.txt';
  }
}

function normalizeCRLF(text) {
  return text.replace(/\r\n/g, '\n');
}
