import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  BDDGEN_CMD,
  PLAYWRIGHT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

for (const style of ['playwright', 'cucumber', 'decorator']) {
  test(`${testDir.name} (${style} style)`, () => {
    const offset = style === 'playwright' ? 1 : 0;
    execPlaywrightTestWithError(
      testDir.name,
      [
        `Found step definitions with incorrect arguments: ${style === 'decorator' ? 3 : 2}`,
        `Function has ${3 + offset} arguments, but expected 0-${2 + offset}.`,
        `Function has ${2 + offset} arguments, but expected 0-${1 + offset}.`,
      ],
      { cmd: `${BDDGEN_CMD} --tags "not @explicit"`, env: { FEATURES_DIR: `${style}-style` } },
    );
  });
}

test(`${testDir.name} (playwright style, valid)`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: `${BDDGEN_CMD} --tags "@valid" && ${PLAYWRIGHT_CMD}`,
    env: { FEATURES_DIR: 'playwright-style' },
  });
});

test(`${testDir.name} (decorator style, valid)`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: `${BDDGEN_CMD} --tags "@valid"`,
    env: { FEATURES_DIR: 'decorator-style' },
  });
});

test(`${testDir.name} (playwright style, arityCheck disabled)`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: `${BDDGEN_CMD} --tags "not @explicit"`,
    env: { FEATURES_DIR: 'playwright-style', ARITY_CHECK: 'false' },
  });
});

test(`${testDir.name} (step true overrides config false)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'Found step definitions with incorrect arguments: 1',
      'Function has 3 arguments, but expected 0-2.',
    ],
    {
      cmd: `${BDDGEN_CMD} --tags "@explicit"`,
      env: { FEATURES_DIR: 'playwright-style', ARITY_CHECK: 'false' },
    },
  );
});
