import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name);

  checkSkipScenario();
  checkSkipFeature();
  checkFailTag();
  checkRetriesTag();
  checkModeTag();
});

function checkSkipScenario() {
  const specFile = `.features-gen/skip-scenario.feature.spec.js`;
  testDir.expectFileContains(specFile, [
    'test.skip("skipped scenario",',
    'test.fixme("fixme scenario",',
    'test.describe.skip("skipped scenario outline",',
    'test("Example #1",',
    'test.skip("Example #2",',
  ]);
  testDir.expectFileContainsCounts(specFile, {
    '}) => {});': 3,
  });
}

function checkSkipFeature() {
  testDir.expectFileNotExist(`.features-gen/skip-feature.feature.spec.js`);
}

function checkFailTag() {
  testDir.expectFileContains(`.features-gen/fail-feature.feature.spec.js`, [
    `${' '.repeat(2)}test.fail();`,
    'test("scenario 1"',
    'test("scenario 2"',
  ]);
  testDir.expectFileContains(`.features-gen/fail-scenario.feature.spec.js`, [
    `${' '.repeat(4)}test.fail();`,
    'test("scenario 1"',
    'test("Example #1"',
    `${' '.repeat(6)}test.fail();`,
    'test("Example #2"',
  ]);
}

function checkRetriesTag() {
  testDir.expectFileContains(`.features-gen/retries.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"retries":3});`,
    `${' '.repeat(2)}test.describe(() => {`,
    `${' '.repeat(4)}test.describe.configure({"retries":2});`,
    `${' '.repeat(4)}test.describe.configure({"retries":1});`,
    `${' '.repeat(4)}test.describe.configure({"retries":0});`,
  ]);
}

function checkModeTag() {
  testDir.expectFileContains(`.features-gen/mode.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"mode":"parallel"});`,
    `${' '.repeat(4)}test.describe.configure({"mode":"default"});`,
  ]);
}
