import { test, getTestName, execPlaywrightTest } from '../_helpers/index.mjs';

// Skip on CI for Win as it fails with error:
// TypeError: Invalid module "..\\..\\steps\\fixtures.js" is not a valid package name
// todo: investigate
const skip = process.env.CI && process.platform === 'win32';

test(getTestName(import.meta), { skip }, (t) => execPlaywrightTest(t.name));
