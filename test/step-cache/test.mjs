import { rmSync } from 'node:fs';
import {
  BDDGEN_CMD,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  expect,
  expectCalls,
  test,
  TestDir,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const matchCallsFile = testDir.getAbsPath('actual-reports/match-calls.json');

test.beforeEach(() => rmSync(matchCallsFile, { force: true }));

test(`${testDir.name}: reuses candidates for a repeated step during generation`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: BDDGEN_CMD,
    env: { FEATURES: 'features/cache-hit.feature' },
  });
  expectStepMatchCalls({
    'I open the catalog': {
      'I open the catalog': { calls: 2 },
      '^I close the catalog$': { calls: 1 },
    },
  });
});

test(`${testDir.name}: passes the actual DocString and DataTable to repeated steps`, () => {
  const output = execPlaywrightTest(testDir.name, {
    env: { FEATURES: 'features/block-arguments.feature' },
  });
  expectCalls('worker 0: ', output, [
    'Given I read a payload (DocString "")',
    'Given I read a payload (DocString "hello")',
    'Given I read a payload (DataTable [["name"],["Alice"]])',
    'Given I read a payload (DataTable [["name"],["Bob"]])',
  ]);
});

test(`${testDir.name}: distinguishes step text from a block argument marker`, () => {
  execPlaywrightTest(testDir.name, { env: { FEATURES: 'features/check-collision.feature' } });
});

test(`${testDir.name}: caches a missing step during generation`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: BDDGEN_CMD,
    env: { FEATURES: 'features/cache-missing-step.feature', MISSING_STEPS: 'fail-on-run' },
  });
  expectStepMatchCalls({
    'I read a payload': {
      'I read a payload:body{DocString}': { calls: 2, matches: 1 },
    },
  });
});

test(`${testDir.name}: reports all candidates when a cached step becomes ambiguous`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'Multiple definitions matched scenario step',
      "  - Given 'I choose an item'",
      "  - Given '^I choose an item$'",
    ],
    { cmd: BDDGEN_CMD, env: { FEATURES: 'features/ambiguous.feature' } },
  );
});

function expectStepMatchCalls(expected) {
  expect(JSON.parse(testDir.getFileContents(matchCallsFile))).toMatchObject(expected);
}
