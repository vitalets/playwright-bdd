import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (empty fixture)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [`No fixtures found for decorator step "BasePage: step" in "scenario 1"`],
    { env: { FEATURE: 'empty-fixture.feature' } },
  );
});

test(`${testDir.name} (ambiguous fixture)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Several fixtures found for decorator step "TodoPage: step" in "ambiguous fixtures for TodoPage: step"`,
      `Possible fixtures: adminPage, adminPage2`,
    ],
    { env: { FEATURE: 'ambiguous-fixture.feature' } },
  );
});
