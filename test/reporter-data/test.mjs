import { test, normalize, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  const output = testDir.getFileContents('actual-reports/report.txt');
  checkStepLocations(output);
  checkStepTitles(output);
});

function checkStepLocations(output) {
  expect(output).toContain(
    `Given I am on home page ${normalize('.features-gen/features/sample.feature.spec.js')}:12:11`,
  );
  expect(output).toContain(`page.goto(https://example.com) ${normalize('features/pom.ts')}:11:21`);
  expect(output).toContain(
    `And decorator step ${normalize('.features-gen/features/sample.feature.spec.js')}:13:11`,
  );

  expect(output).toContain(`Before Hooks :0:0`);
  expect(output).toContain(`BeforeAll Hooks`);
  expect(output).toContain(`BeforeAll hook ${normalize('features/steps.ts')}:14:1`);
  expect(output).toContain(`named BeforeAll hook ${normalize('features/steps.ts')}:15:1`);
  expect(output).toContain(`named AfterAll hook ${normalize('features/steps.ts')}:16:1`);

  expect(output).toContain(`BeforeEach Hooks`);
  expect(output).toContain(`hook 1 ${normalize('features/steps.ts')}:12:1`);
  expect(output).toContain(`BeforeEach hook ${normalize('features/steps.ts')}:13:1`);

  expect(output).toContain(
    `Background ${normalize('.features-gen/features/sample.feature.spec.js')}:6:8`,
  );
}

function checkStepTitles(output) {
  // prepended keywords
  expect(output).toContain(`Given background step`);
  expect(output).toContain(`And Action 1`);
  expect(output).toContain(`When Action 2`);
  expect(output).toContain(`And Action 3`);
  expect(output).toContain(`Then Action 4`);
  expect(output).toContain(`But Action 5`);
  expect(output).toContain(`* Action 6`);
  // examples
  expect(output).toContain(`Given Action 42`);
}
