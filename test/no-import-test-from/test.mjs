import test from 'node:test';
import { getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(
    t.name,
    `When using custom "test" function in createBdd() you should`,
  ),
);
