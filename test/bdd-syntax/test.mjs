import {
  test,
  TestDir,
  execPlaywrightTest,
  playwrightVersion,
  DEFAULT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (playwright-style)`, () => {
  execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --project=pw-style`);
  checkResults('.features-gen/pw-style/features');
});

test(`${testDir.name} (cucumber-style)`, () => {
  execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --project=cucumber-style`);
  checkResults('.features-gen/cucumber-style/features');
});

function checkResults(outDir) {
  checkOnlySkip(outDir);
  checkFailTag(outDir);
  checkTimeoutTag(outDir);
  checkRetriesTag(outDir);
  checkModeTag(outDir);
  checkSkippedFeature(outDir);
  checkImportTestPath(outDir);
  checkBackgroundWithoutScenarios(outDir);
  checkTags(outDir);
}

function checkOnlySkip(outDir) {
  const generatedFile = `${outDir}/special-tags/only-skip-fixme.feature.spec.js`;
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

function checkSkippedFeature(outDir) {
  testDir.expectFileNotExist(`${outDir}/skip-feature.feature.spec.js`);
}

function checkImportTestPath(outDir) {
  testDir.expectFileContains(`${outDir}/scenario-simple.feature.spec.js`, [
    outDir.includes('cucumber-style')
      ? 'import { test } from "playwright-bdd";'
      : 'import { test } from "../../../steps-pw-style/fixtures.ts";',
  ]);
}

function checkBackgroundWithoutScenarios(outDir) {
  testDir.expectFileNotExist(`${outDir}/background-no-scenarios.feature.spec.js`);
}

function checkTags(outDir) {
  if (playwrightVersion >= '1.42.0') {
    testDir.expectFileContains(`${outDir}/tags.feature.spec.js`, [
      'test("Simple scenario", { tag: ["@foo", "@bar", "@baz", "@jira:123"] }, async',
      'test("Example #1", { tag: ["@foo", "@bar", "@scenario-outline", "@scenario-outline-examples1"] }, async',
    ]);
  } else {
    testDir.expectFileContains(`${outDir}/tags.feature.spec.js`, [
      'test("Simple scenario", async',
      'test("Example #1", async',
    ]);
  }
}

function checkFailTag(outDir) {
  testDir.expectFileContains(`${outDir}/special-tags/fail-feature.feature.spec.js`, [
    'test.fail("failed scenario 1"',
    'test.fail("failed scenario 2"',
  ]);
  testDir.expectFileContains(`${outDir}/special-tags/fail-scenario.feature.spec.js`, [
    'test.fail("failed scenario"',
  ]);
}

function checkRetriesTag(outDir) {
  testDir.expectFileContains(`${outDir}/special-tags/retries.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"retries":3});`,
    `${' '.repeat(2)}test.describe(() => {`,
    `${' '.repeat(4)}test.describe.configure({"retries":2});`,
    `${' '.repeat(4)}test.describe.configure({"retries":1});`,
  ]);
}

function checkTimeoutTag(outDir) {
  testDir.expectFileContains(`${outDir}/special-tags/timeout.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"timeout":5000});`,
    `${' '.repeat(2)}test.describe(() => {`,
    `${' '.repeat(4)}test.describe.configure({"timeout":4000});`,
    `${' '.repeat(4)}test.describe.configure({"timeout":3000});`,
  ]);
}

function checkModeTag(outDir) {
  testDir.expectFileContains(`${outDir}/special-tags/mode.feature.spec.js`, [
    `${' '.repeat(2)}test.describe.configure({"mode":"parallel"});`,
    `${' '.repeat(4)}test.describe.configure({"mode":"default"});`,
  ]);
}
