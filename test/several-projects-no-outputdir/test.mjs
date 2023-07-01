import test from 'node:test';
import { getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, `please manually provide different "outputDir" option`),
);
