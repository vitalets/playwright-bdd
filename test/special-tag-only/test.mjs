import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name);

  checkOnlyFeature();
  checkOnlyScenario();
});

function checkOnlyFeature() {
  testDir.expectFileContains('.features-gen/only-feature.feature.spec.js', [
    'test.describe.only("only feature",',
    'test.skip("skipped scenario",',
  ]);
}

function checkOnlyScenario() {
  testDir.expectFileContains('.features-gen/only-scenario.feature.spec.js', [
    'test.only("scenario with only"',
    'test("scenario without only"',
    'test.only("scenario with only and other tags"',
    'test.only("scenario with only and skip"',
    'test.describe.only("scenario outline with only"',
    'test.only("Example #2"',
  ]);
}
