import { test, getTestName, execPlaywrightTestWithError } from '../_helpers/index.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, [
    `Option "importTestFrom" should point to a separate file`,
    /Given, When, Then\)$/, // no other text after error
  ]),
);
