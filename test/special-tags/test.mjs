import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name);

  checkSkipScenario();
  checkSkipFeature();
  checkFailTag();
  checkTimeoutTag();
  checkSlowTag();
  checkRetriesTag();
  checkModeTag();
});

function checkSkipScenario() {
  testDir.expectFileContains(`.features-gen/skip-scenario.feature.spec.js`, [
    'test.skip("skipped scenario", async ({  }) => {});',
    'test.fixme("fixme scenario", async ({  }) => {});',
    'test.describe.skip("skipped scenario outline", () => {});',
    'test("Example #1", async ({ Given }) => {',
    'test.skip("Example #2", async ({  }) => {});',
  ]);
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
  ]);
}

function checkTimeoutTag() {
  testDir.expectFileContains(`.features-gen/timeout.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"timeout":5000});`,
    `${' '.repeat(4)}test.setTimeout(4000);`,
    `${' '.repeat(4)}test.describe.configure({"timeout":3000});`,
    `${' '.repeat(6)}test.setTimeout(2000);`,
  ]);
}

function checkSlowTag() {
  testDir.expectFileContains(`.features-gen/slow.feature.spec.js`, [
    `${' '.repeat(2)}test.slow();`,
    `${' '.repeat(4)}test.slow();`,
  ]);
}

function checkModeTag() {
  testDir.expectFileContains(`.features-gen/mode.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"mode":"parallel"});`,
    `${' '.repeat(4)}test.describe.configure({"mode":"default"});`,
  ]);
}
