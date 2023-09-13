import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test.only(getTestName(import.meta), (t) => execPlaywrightTest(t.name));
