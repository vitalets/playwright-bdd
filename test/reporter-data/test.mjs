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
const expectedDir =
  playwrightVersion < '1.42' ? 'till-1.41' : playwrightVersion < '1.46' ? 'till-1.45' : 'current';
const expectedReportPath = `expected-reports/${expectedDir}/report.txt`;

test(testDir.name, () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  checkStepsTree();
});

function checkStepsTree() {
  const expectedTree = testDir.getFileContents(expectedReportPath);
  const actualTree = testDir.getFileContents('actual-reports/report.txt');
  expect(actualTree).toEqual(expectedTree);
}
