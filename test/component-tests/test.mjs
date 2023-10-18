import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), { only: true }, (t) => execPlaywrightTest(t.name));
