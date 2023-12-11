import { test, getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(
    t.name,
    `createBdd() should use 'test' extended from "playwright-bdd"`,
  ),
);
