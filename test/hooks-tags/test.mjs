import {
  test,
  expect,
  TestDir,
  execPlaywrightTest,
  playwrightVersion,
  BDDGEN_CMD,
  PLAYWRIGHT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const pwSupportsTags = playwrightVersion >= '1.42.0';

test(`${testDir.name} (run all tests)`, () => {
  const stdout = execPlaywrightTest(testDir.name);

  expectCalls('worker 0: ', stdout, [
    'setup fixture for bar',
    'setup fixture for foo',
    'Before @bar scenario 1',
    'Step 1',
    'After @bar scenario 1',
    'setup fixture for bar',
    'setup fixture for foo',
    'Before @foo and not @bar scenario 2',
    'Step 2',
    'After @foo and not @bar scenario 2',
    'Step 3',
  ]);
});

test(`${testDir.name} (gen only bar)`, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} --tags "@bar" && ${PLAYWRIGHT_CMD}`,
  );

  expectCalls('worker 0: ', stdout, [
    'setup fixture for bar', // prettier-ignore
    'Before @bar scenario 1',
    'Step 1',
    'After @bar scenario 1',
  ]);
});

test(`${testDir.name} (gen not bar)`, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} --tags "not @bar" && ${PLAYWRIGHT_CMD}`,
  );

  expectCalls('worker 0: ', stdout, [
    'setup fixture for foo', // prettier-ignore
    'Before @foo and not @bar scenario 2',
    'Step 2',
    'After @foo and not @bar scenario 2',
    'Step 3',
  ]);
});

test(`${testDir.name} (run bar)`, { skip: !pwSupportsTags }, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD} --grep "@bar"`,
  );

  expectCalls('worker 0: ', stdout, [
    // initialization of fixtureForFoo is expected,
    // b/c both scenarios are in the same file.
    // We can't know beforehand, which scenarios will be filtered with PW tags in runtime.
    // Looks like a minor issue.
    'setup fixture for bar', // prettier-ignore
    'setup fixture for foo',
    'Before @bar scenario 1',
    'Step 1',
    'After @bar scenario 1',
  ]);
});

test(`${testDir.name} (run not bar)`, { skip: !pwSupportsTags }, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD} --grep-invert "@bar"`,
  );

  expectCalls('worker 0: ', stdout, [
    // initialization of fixtureForBar is expected,
    // b/c both scenarios are in the same file.
    // We can't know beforehand, which will it be filtered with PW tags in runtime.
    // Looks like a minor issue.
    'setup fixture for bar', // prettier-ignore
    'setup fixture for foo',
    'Before @foo and not @bar scenario 2',
    'Step 2',
    'After @foo and not @bar scenario 2',
    'Step 3',
  ]);
});

test(`${testDir.name} (gen not foo)`, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} --tags "not @foo" && ${PLAYWRIGHT_CMD}`,
  );

  expectCalls('worker 0: ', stdout, ['Step 3']);
});

test(`${testDir.name} (run not foo)`, { skip: !pwSupportsTags }, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD} --grep-invert "@foo"`,
  );

  expectCalls('worker 0: ', stdout, ['Step 3']);
});

function expectCalls(prefix, stdout, expectedCalls) {
  const calls = stdout.split('\n').filter((line) => line.startsWith(prefix));
  expect(calls).toEqual(expectedCalls.map((call) => prefix + call));
}
