import {
  test,
  TestDir,
  expect,
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
  checkScenarioOutline(outDir);
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

function checkScenarioOutline(outDir) {
  const content = testDir.getFileContents(`${outDir}/scenario-outline.feature.spec.js`);

  // Check doubled
  expect(content).toContain(`Given("State 2")`);
  expect(content).toContain(`Given("State 3")`);
  expect(content).toContain(`Given("State 4")`);
  expect(content).toContain(`Then("Doubled 2 equals 4")`);
  expect(content).toContain(`Then("Doubled 3 equals 6")`);
  expect(content).toContain(`Then("Doubled 4 equals 8")`);

  // Check uppercase
  expect(content).toContain(`Then("Uppercase \\"hi\\" equals \\"HI\\"")`);
  expect(content).toContain(`Then("Uppercase \\"fo\\" equals \\"FO\\"")`);

  // Custom titles
  expect(content).toContain(`test("Test with 2 and \\"4\\", extra >, without <notexist>",`);
  expect(content).toContain(`test("Test with 3 and \\"6\\", extra >, without <notexist>",`);

  // Scenario title used as a template
  expect(content).toContain(
    `test("Scenario title used as a template with 2 and \\"4\\", extra <, without <notexist>",`,
  );
  expect(content).toContain(
    `test("Scenario title used as a template with 3 and \\"6\\", extra <, without <notexist>",`,
  );

  // scenarios without examples
  expect(content).toContain(`test("scenario outline without examples",`);
  expect(content).toContain(`test.describe("scenario outline with empty examples (1)", () => {});`);
  expect(content).toContain(`test.describe("scenario outline with empty examples (2)", () => {});`);
}
