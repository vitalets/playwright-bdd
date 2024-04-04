import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name);

  checkOnlySkip();
  checkFailTag();
  checkTimeoutTag();
  checkRetriesTag();
  checkModeTag();
  checkSkippedFeature();
});

function checkOnlySkip() {
  const generatedFile = `.features-gen/only-skip-fixme.feature.spec.js`;
  testDir.expectFileContains(generatedFile, [
    'test.describe.only("only-skip-fixme"',
    'test.only("Only"',
    'test.only("Only several tags"',
    'test.only("Skip with only"',
    'test.describe.only("Check doubled"',
    'test.only("Example #1"',
    'test.only("Example #2"',
    // skipped
    'test.skip("Skip"',
    'test.fixme("Fixme"',
    'test.skip("Example #3"',
    'test.describe.skip("Skipped scenario outline"',
  ]);
  testDir.expectFileNotContain(generatedFile, ['Skipped step']);
}

function checkSkippedFeature() {
  testDir.expectFileNotExist(`.features-gen/skip-feature.feature.spec.js`);
}

function checkFailTag() {
  testDir.expectFileContains(`.features-gen/fail-feature.feature.spec.js`, [
    'test.fail("failed scenario 1"',
    'test.fail("failed scenario 2"',
  ]);
  testDir.expectFileContains(`.features-gen/fail-scenario.feature.spec.js`, [
    'test.fail("failed scenario"',
  ]);
}

function checkRetriesTag() {
  testDir.expectFileContains(`.features-gen/retries.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"retries":3});`,
    `${' '.repeat(2)}test.describe(() => {`,
    `${' '.repeat(4)}test.describe.configure({"retries":2});`,
    `${' '.repeat(4)}test.describe.configure({"retries":1});`,
  ]);
}

function checkTimeoutTag() {
  testDir.expectFileContains(`.features-gen/timeout.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"timeout":5000});`,
    `${' '.repeat(2)}test.describe(() => {`,
    `${' '.repeat(4)}test.describe.configure({"timeout":4000});`,
    `${' '.repeat(4)}test.describe.configure({"timeout":3000});`,
  ]);
}

function checkModeTag() {
  testDir.expectFileContains(`.features-gen/mode.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"mode":"parallel"});`,
    `${' '.repeat(4)}test.describe.configure({"mode":"default"});`,
  ]);
}
