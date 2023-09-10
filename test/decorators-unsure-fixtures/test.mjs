import { test, getTestName, execPlaywrightTestWithError, DEFAULT_CMD } from '../helpers.mjs';

test(
  getTestName(import.meta),
  (t) =>
    execPlaywrightTestWithError(
      t.name,
      [
        `Can't guess fixture for decorator step "BasePage: step" in file: features/guess.feature`,
        `Please refactor your Page Object classes or set one of the following tags: @fixture:todoPage, @fixture:todoPage2`,
      ],
      `FEATURE=guess.feature ${DEFAULT_CMD}`,
    ),

  // todo:
  // execPlaywrightTestWithError(t.name, [`sgsedg`], `FEATURE=scenario-tag.feature ${DEFAULT_CMD}`),
);
