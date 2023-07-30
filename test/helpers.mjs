import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import fs from 'node:fs';
import { expect } from '@playwright/test';

defineTestOnly(test);
export { test };

/**
 * Test name = test dir from 'test/xxx/test.mjs'
 */
export function getTestName(importMeta) {
  return importMeta.url.split('/').slice(-2)[0];
}

function execPlaywrightTestInternal(dir, cmd) {
  dir = path.join('test', dir);
  cmd = cmd || 'node ../../dist/gen/cli && npx playwright test';
  const stdout = execSync(cmd, { cwd: dir, stdio: 'pipe' });
  return stdout?.toString() || '';
}

export function execPlaywrightTest(dir, cmd) {
  try {
    const stdout = execPlaywrightTestInternal(dir, cmd);
    if (process.env.TEST_DEBUG) console.log(stdout);
    return stdout;
  } catch (e) {
    // if playwright tests not passed -> output is in stdout
    // if playwright cmd exits -> output is in stderr
    // if test.mjs not passed -> output is in stderr
    // That's why always print stdout + stderr
    console.log(e.message);
    console.log(e.stdout?.toString());
    console.log(e.stderr?.toString());
    process.exit(1);
  }
}

export function execPlaywrightTestWithError(dir, error, cmd) {
  assert.throws(
    () => execPlaywrightTestInternal(dir, cmd),
    (e) => {
      const stderr = e.stderr.toString();
      const errors = Array.isArray(error) ? error : [error];
      errors.forEach((error) => expect(stderr).toContain(error));
      return true;
    },
  );
}

export function defineTestOnly(test) {
  test.only = (title, fn) => {
    if (process.env.FORBID_ONLY) throw new Error(`test.only is forbidden`);
    test(title, { only: true }, fn);
  };
}

export function clearDir(importMeta, relativePath) {
  const absPath = new URL(relativePath, importMeta.url);
  if (fs.existsSync(absPath)) fs.rmSync(absPath, { recursive: true });
}

export function expectFileExists(importMeta, file) {
  const absPath = new URL(file, importMeta.url);
  assert(fs.existsSync(absPath), `Missing file: ${file}`);
}
