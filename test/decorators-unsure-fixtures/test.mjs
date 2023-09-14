import path from 'node:path';
import { test, TestDir, execPlaywrightTestWithError, DEFAULT_CMD } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name + ' (guess)', () =>
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Can't guess fixture for decorator step "BasePage: step" in file: ${path.normalize(
        'features/guess.feature',
      )}`,
      `Please refactor your Page Object classes or set one of the following tags: @fixture:todoPage, @fixture:todoPage2`,
    ],
    `npx cross-env FEATURE=guess.feature ${DEFAULT_CMD}`,
  ),
);

test(testDir.name + ' (scenario-tag)', () =>
  execPlaywrightTestWithError(
    testDir.name,
    [`contains 1 step(s) not compatible with required fixture "todoPage"`],
    `npx cross-env FEATURE=scenario-tag.feature ${DEFAULT_CMD}`,
  ),
);

test(testDir.name + ' (feature-tag)', () =>
  execPlaywrightTestWithError(
    testDir.name,
    [`contains 1 step(s) not compatible with required fixture "todoPage"`],
    `npx cross-env FEATURE=feature-tag.feature ${DEFAULT_CMD}`,
  ),
);

test(testDir.name + ' (bg)', () =>
  execPlaywrightTestWithError(
    testDir.name,
    [`Scenario "Background" contains 1 step(s) not compatible with required fixture "todoPage"`],
    `npx cross-env FEATURE=bg.feature ${DEFAULT_CMD}`,
  ),
);
