import {
  test,
  expect,
  TestDir,
  execPlaywrightTest,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// Since PW 1.46 there is a 'box' option for the fixture, that hides it from the report.
// Till Pw 1.41 first trace was attached to BeforeAll hooks, not to top level test.steps.
const expectedReportName =
  playwrightVersion < '1.42'
    ? 'report-till-1.42.txt'
    : playwrightVersion < '1.46'
      ? 'report-till-1.46.txt'
      : 'report-current.txt';

test(testDir.name, () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  checkStepsTree();
});

function checkStepsTree() {
  const expectedTree = testDir.getFileContents(`expected-reports/${expectedReportName}`);
  const actualTree = testDir.getFileContents('actual-reports/report.txt');
  expect(normalizeCRLF(actualTree)).toEqual(normalizeCRLF(expectedTree));
}

function normalizeCRLF(text) {
  return text.replace(/\r\n/g, '\n');
}
