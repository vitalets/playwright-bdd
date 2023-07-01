import test from 'node:test';
import { getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), (t) => execPlaywrightTest(t.name, {}, 'npm test'));
