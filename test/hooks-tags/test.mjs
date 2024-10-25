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

  expect(stdout).toContain('setup fixture for foo');
  expect(stdout).toContain('setup fixture for bar');
  expect(stdout).toContain('step in sample2');

  expectHookCalls(stdout, [
    'Before @bar scenario 1',
    'Step scenario 1',
    'After @bar scenario 1',
    'Before @foo and not @bar scenario 2',
    'Step scenario 2',
    'After @foo and not @bar scenario 2',
  ]);
});

test(`${testDir.name} (gen only bar)`, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} --tags "@bar" && ${PLAYWRIGHT_CMD}`,
  );

  expect(stdout).not.toContain('setup fixture for foo');
  expect(stdout).toContain('setup fixture for bar');

  expectHookCalls(stdout, [
    'Before @bar scenario 1', // prettier-ignore
    'Step scenario 1',
    'After @bar scenario 1',
  ]);
});

test(`${testDir.name} (gen not bar)`, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} --tags "not @bar" && ${PLAYWRIGHT_CMD}`,
  );

  expect(stdout).toContain('setup fixture for foo');
  expect(stdout).not.toContain('setup fixture for bar');
  expect(stdout).toContain('step in sample2');

  expectHookCalls(stdout, [
    'Before @foo and not @bar scenario 2', // prettier-ignore
    'Step scenario 2',
    'After @foo and not @bar scenario 2',
  ]);
});

test(`${testDir.name} (run bar)`, { skip: !pwSupportsTags }, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD} --grep "@bar"`,
  );

  // initialization of fixtureForFoo is expected,
  // b/c both scenarios are in the same file.
  // We can't know beforehand, which will it be filtered with PW tags in runtime.
  // Looks like a minor issue.
  expect(stdout).toContain('setup fixture for foo');
  expect(stdout).toContain('setup fixture for bar');

  expectHookCalls(stdout, [
    'Before @bar scenario 1', // prettier-ignore
    'Step scenario 1',
    'After @bar scenario 1',
  ]);
});

test(`${testDir.name} (run not bar)`, { skip: !pwSupportsTags }, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD} --grep-invert "@bar"`,
  );

  expect(stdout).toContain('setup fixture for foo');
  // initialization of fixtureForBar is expected,
  // b/c both scenarios are in the same file.
  // We can't know beforehand, which will it be filtered with PW tags in runtime.
  // Looks like a minor issue.
  expect(stdout).toContain('setup fixture for bar');
  expect(stdout).toContain('step in sample2');

  expectHookCalls(stdout, [
    'Before @foo and not @bar scenario 2', // prettier-ignore
    'Step scenario 2',
    'After @foo and not @bar scenario 2',
  ]);
});

test(`${testDir.name} (gen not foo)`, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} --tags "not @foo" && ${PLAYWRIGHT_CMD}`,
  );

  expect(stdout).toContain('step in sample2');

  expect(stdout).not.toContain('setup fixture for foo');
  expect(stdout).not.toContain('setup fixture for bar');
  expectHookCalls(stdout, []);
});

test(`${testDir.name} (run not foo)`, { skip: !pwSupportsTags }, () => {
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD} --grep-invert "@foo"`,
  );

  expect(stdout).toContain('step in sample2');

  expect(stdout).not.toContain('setup fixture for foo');
  expect(stdout).not.toContain('setup fixture for bar');
  expectHookCalls(stdout, []);
});

function expectHookCalls(stdout, hookCalls) {
  expect(stdout).toContain(['Start', ...hookCalls, 'End'].join('\n'));
}
