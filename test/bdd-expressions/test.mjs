import {
  test,
  expect,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

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

test(`${testDir.name} (DocString and DataTable parameters and report captures)`, () => {
  execPlaywrightTest(testDir.name, {
    env: { FEATURES: 'features/docstring-and-data-table.feature' },
  });
  expect(extractParamsFromReport('actual-reports/messages.ndjson')).toEqual([
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ]);
});

test(`${testDir.name} (DocString and DataTable mismatches fail generation)`, () => {
  execPlaywrightTestWithError(testDir.name, ['Missing step definitions:', 'optional payload:'], {
    cmd: BDDGEN_CMD,
    env: { FEATURES: 'features/docstring-and-data-table-mismatches.feature', TAGS: '@missing' },
  });
});

test(`${testDir.name} (DocString and DataTable mismatches fail at runtime)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    ['Missing step: Given payload', 'Missing step: Given optional payload:'],
    {
      env: {
        FEATURES: 'features/docstring-and-data-table-mismatches.feature',
        TAGS: '@missing',
        MISSING_STEPS: 'fail-on-run',
      },
    },
  );
});

test(`${testDir.name} (DocString and DataTable mismatches skip scenarios)`, () => {
  const output = execPlaywrightTest(testDir.name, {
    env: {
      FEATURES: 'features/docstring-and-data-table-mismatches.feature',
      TAGS: '@missing',
      MISSING_STEPS: 'skip-scenario',
    },
  });
  expect(output).toContain('8 skipped');
});

test(`${testDir.name} (DocString and DataTable arity)`, () => {
  execPlaywrightTestWithError(testDir.name, ['Function has 3 arguments, but expected 0-2.'], {
    cmd: BDDGEN_CMD,
    env: { FEATURES: 'features/docstring-and-data-table-mismatches.feature', TAGS: '@arity' },
  });
});

test(`${testDir.name} (strict and permissive definitions remain ambiguous)`, () => {
  execPlaywrightTestWithError(testDir.name, ['Multiple definitions matched scenario step.'], {
    cmd: BDDGEN_CMD,
    env: { FEATURES: 'features/docstring-and-data-table-mismatches.feature', TAGS: '@ambiguous' },
  });
});

test(`${testDir.name} (custom DocString and DataTable types take precedence)`, () => {
  execPlaywrightTest(testDir.name, {
    env: { FEATURES: 'features/custom-parameter-types.feature', CUSTOM_PARAMETER_TYPES: 'true' },
  });
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
