import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

// Skip on CI for Win as it fails with error:
// TypeError: Invalid module "..\\..\\steps\\fixtures.js" is not a valid package name
// todo: investigate
// try run esm on win
const skip = false; // process.env.CI && process.platform === 'win32';

const testDir = new TestDir(import.meta);

test(testDir.name, { skip }, () => execPlaywrightTest(testDir.name));
