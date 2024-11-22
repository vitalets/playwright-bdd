import { test, TestDir, normalize, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (empty pom fixture)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `No POM fixtures found for decorator step "BasePage: step"`,
      `at ${normalize('features/empty-fixture.feature:4:5')}`,
    ],
    { env: { FEATURE: 'empty-fixture.feature' } },
  );
});

test(`${testDir.name} (ambiguous pom fixture)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Multiple POM fixtures found for decorator step "TodoPage: step"`,
      `at ${normalize('features/ambiguous-fixture.feature:4:5')}`,
      `Possible fixtures: adminPage, adminPage2`,
    ],
    { env: { FEATURE: 'ambiguous-fixture.feature' } },
  );
});
