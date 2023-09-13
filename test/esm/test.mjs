import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test.skip(getTestName(import.meta), (t) => execPlaywrightTest(t.name));
