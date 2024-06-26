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
  checkImportTestPath(outDir);
  checkBackgroundWithoutScenarios(outDir);
  checkTags(outDir);
}

function checkImportTestPath(outDir) {
  testDir.expectFileContains(`${outDir}/scenario-simple.feature.spec.js`, [
    outDir.includes('cucumber-style')
      ? 'import { test } from "../../../steps-cucumber-style/fixtures.ts";'
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
