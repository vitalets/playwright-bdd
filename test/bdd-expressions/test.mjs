import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (named values, overrides and positional compatibility)`, () => {
  execPlaywrightTest(testDir.name);
  const captures = extractParamsFromReport('actual-reports/messages.ndjson');
  expect(captures.slice(0, 2)).toEqual([
    [
      { parameterTypeName: 'int', start: 7, value: '3' },
      { parameterTypeName: 'string', start: 19, value: '"Alice"' },
    ],
    [
      { parameterTypeName: 'int', start: 7, value: '2' },
      { parameterTypeName: 'string', start: undefined, value: undefined },
    ],
  ]);
});

function extractParamsFromReport(fileName) {
  const messages = testDir.getFileContents(fileName).trim().split('\n').map(JSON.parse);
  const testCaseMessage = messages.find((message) => message.testCase);
  return testCaseMessage?.testCase.testSteps.map((step) =>
    step.stepMatchArgumentsLists[0].stepMatchArguments.map(({ group, parameterTypeName }) => ({
      parameterTypeName,
      start: group.start,
      value: group.value,
    })),
  );
}
