/**
 * Helpers for running bddgen + playwright test.
 */
import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';

export const BDDGEN_CMD = 'node ../node_modules/playwright-bdd/dist/cli';
export const PLAYWRIGHT_CMD = 'npx playwright test';
export const DEFAULT_CMD = `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD}`;

export function execPlaywrightTest(dir, cmd) {
  try {
    const stdout = execPlaywrightTestInternal(dir, cmd);
    if (process.env.TEST_DEBUG) console.log('STDOUT:', stdout);
    // no way to get stderr here.
    // see: https://stackoverflow.com/questions/57484453/how-to-get-err-stderr-from-execsync
    return stdout;
  } catch (e) {
    // if playwright tests not passed -> output is in stdout
    // if playwright cmd exits -> output is in stderr
    // if test.mjs not passed -> output is in stderr
    // That's why always print stdout + stderr
    console.log('STDERR:', e.stderr?.toString());
    console.log('STDOUT:', e.stdout?.toString());
    console.log(e.message);
    process.exit(1);
  }
}

/**
 * Runs Playwright test with expected error output.
 */
export function execPlaywrightTestWithError(dir, error, cmd) {
  try {
    const stdout = execPlaywrightTestInternal(dir, cmd);
    console.log(`Expected to exit with error: ${error}`);
    console.log('STDOUT:', stdout);
    process.exit(1);
  } catch (e) {
    const stdout = e.stdout?.toString().trim() || '';
    const stderr = e.stderr?.toString().trim() || '';
    if (!error) {
      // if error is not set, check that e.message equals exactly command
      // to distinguish from other unexpected errors
      const expectedOutput = `Command failed: ${getCmdStr(cmd)}`;
      if (e.message !== expectedOutput) {
        console.log(`Command exited with incorrect error.`);
        console.log(`Expected:\n${expectedOutput}`);
        console.log(`Actual:\n${e.message}`);
        process.exit(1);
      }
    } else {
      // e.message can include whole stderr
      e.message = e.message.replace(stderr, '').trim();
      const output = [e.message, stderr, stdout].filter(Boolean).join('\n');
      const errors = Array.isArray(error) ? error : [error];
      errors.forEach((error) => {
        if (typeof error === 'string') {
          assert(
            output.includes(error),
            [
              `Expected output to include "${error}"`, // prettier-ignore
              `ERROR: ${e.message}`,
              `STDERR: ${stderr}`,
              `STDOUT: ${stdout}`,
            ].join('\n'),
          );
        } else {
          assert.match(output, error);
        }
      });
    }

    if (process.env.TEST_DEBUG) console.log('STDOUT:', stdout);

    return stdout;
  }
}

export function execPlaywrightTestInternal(dir, cmd) {
  const cwd = path.join('test', dir);
  const cmdStr = getCmdStr(cmd);
  const env = Object.assign({}, process.env, cmd?.env);
  const stdout = execSync(cmdStr, { cwd, stdio: 'pipe', env })?.toString() || '';
  return stdout;
}

function getCmdStr(cmd) {
  return (typeof cmd === 'string' ? cmd : cmd?.cmd) || DEFAULT_CMD;
}
