import { test, getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, [
    `Can't guess fixture for decorator step "BasePage: step" in file: sample.feature`,
    `Please set one of the following tags (@fixture:todoPage, @fixture:todoPage2)`,
  ]),
);
