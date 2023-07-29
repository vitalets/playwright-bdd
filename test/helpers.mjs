import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import fs from 'node:fs';
import { expect } from '@playwright/test';

const stdioForErrors = process.env.TEST_DEBUG ? 'inherit' : 'pipe';

defineTestOnly(test);
export { test };

export function getTestName(importMeta) {
  return importMeta.url.split('/').slice(-2)[0];
}

export function execPlaywrightTest(dir, opts, cmd) {
  opts = Object.assign({ stdio: 'inherit' }, opts);
  cmd = cmd || 'node ../../dist/gen/cli && npx playwright test';
  try {
    const stdout = execSync(cmd, {
      cwd: path.join(`test`, dir),
      ...opts,
    });
    return stdout?.toString() || '';
  } catch (e) {
    if (opts.stdio === 'inherit') {
      // error already printed
      process.exit(1);
    } else {
      throw e;
    }
  }
}

export function execPlaywrightTestWithError(dir, substr) {
  assert.throws(
    () => execPlaywrightTest(dir, { stdio: stdioForErrors }),
    (e) => {
      const stdout = e.stdout.toString();
      expect(e.status).toEqual(1);
      substr = Array.isArray(substr) ? substr : [substr];
      substr.forEach((s) => expect(stdout).toContain(s));
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

export function expectFileExists(importMeta, file) {
  const absPath = new URL(file, importMeta.url);
  assert(fs.existsSync(absPath), `Missing file: ${file}`);
}
