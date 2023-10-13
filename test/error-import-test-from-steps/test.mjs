import { test, getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, [
    `Option "importTestFrom" should point to a separate file`,
    /Given, When, Then\)$/, // no other text after error
  ]),
);
