import { test, getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) => execPlaywrightTestWithError(t.name, `No BDD configs found`));
