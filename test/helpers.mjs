import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

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
    execSync(cmd, {
      cwd: path.join(`test`, dir),
      ...opts,
    });
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
      assert.equal(e.status, 1);
      substr = Array.isArray(substr) ? substr : [substr];
      substr.forEach((s) => {
        if (!stdout.includes(s)) {
          assert.fail(`Not found:\n\n${s}\n\nSTDOUT:\n${stdout}`);
        }
      });
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
