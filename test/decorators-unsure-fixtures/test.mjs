import { test, normalize, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name + ' (guess)', () =>
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Can't guess fixture for decorator step "BasePage: step" in file: ${normalize(
        'features/guess.feature',
      )}`,
      `Possible fixtures: 2 (todoPage, todoPage2)`,
      `Please refactor your Page Object classes`,
    ],
    {
      env: { FEATURE: 'guess.feature' },
    },
  ),
);

test(testDir.name + ' (scenario-tag)', () =>
  execPlaywrightTestWithError(
    testDir.name,
    [`contains 1 step(s) not compatible with required fixture "todoPage"`],
    {
      env: { FEATURE: 'scenario-tag.feature' },
    },
  ),
);

test(testDir.name + ' (feature-tag)', () =>
  execPlaywrightTestWithError(
    testDir.name,
    [`contains 1 step(s) not compatible with required fixture "todoPage"`],
    {
      env: { FEATURE: 'feature-tag.feature' },
    },
  ),
);

test(testDir.name + ' (bg)', () =>
  execPlaywrightTestWithError(
    testDir.name,
    [`Scenario "Background" contains 1 step(s) not compatible with required fixture "todoPage"`],
    {
      env: { FEATURE: 'bg.feature' },
    },
  ),
);
