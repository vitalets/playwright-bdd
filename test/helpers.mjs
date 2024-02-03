import { execSync } from 'node:child_process';
// use assert instead of Playwright's expect to have less verbose output
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import fs from 'node:fs';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';

export { test };
export const BDDGEN_CMD = 'node ../node_modules/playwright-bdd/dist/cli';
export const PLAYWRIGHT_CMD = 'npx playwright test';
export const DEFAULT_CMD = `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD}`;

/**
 * Test name = test dir from 'test/<xxx>/test.mjs'
 */
export function getTestName(importMeta) {
  return importMeta.url.split('/').slice(-2)[0];
}

function execPlaywrightTestInternal(dir, cmd) {
  const cwd = path.join('test', dir);
  const cmdStr = getCmdStr(cmd);
  const env = Object.assign({}, process.env, cmd?.env);
  const stdout = execSync(cmdStr, { cwd, stdio: 'pipe', env })?.toString() || '';
  return stdout;
}

function getCmdStr(cmd) {
  return (typeof cmd === 'string' ? cmd : cmd?.cmd) || DEFAULT_CMD;
}

export function execPlaywrightTest(dir, cmd) {
  try {
    const stdout = execPlaywrightTestInternal(dir, cmd);
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
    console.log('STDOUT:', stdout);
    // todo: how to log stderr here?
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
      return stdout;
    }
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

    return stdout;
  }
  assert.fail(`Expected to exit with error: ${error}`);
}

export function getPackageVersion(pkg) {
  const { version } = JSON.parse(fs.readFileSync(`node_modules/${pkg}/package.json`, 'utf8'));

  return version;
}

export function ensureNodeVersion(version) {
  if (!process.version.startsWith(`v${version}.`)) {
    throw new Error(`Expected node version: ${version}`);
  }
}

/**
 * Class to manage files inside current test dir.
 */
export class TestDir {
  constructor(importMeta) {
    this.importMeta = importMeta;
  }

  /**
   * Test name = test dir from 'test/<xxx>/test.mjs'
   */
  get name() {
    return this.importMeta.url.split('/').slice(-2)[0];
  }

  getAbsPath(relativePath) {
    return fileURLToPath(new URL(relativePath, this.importMeta.url));
  }

  clearDir(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    if (fs.existsSync(absPath)) fs.rmSync(absPath, { recursive: true });
  }

  isFileExists(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    return fs.existsSync(absPath);
  }

  getFileContents(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    return fs.readFileSync(absPath, 'utf8');
  }

  getAllFiles(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    return fg.sync(path.join(absPath, '**')).map((file) => path.relative(absPath, file));
  }
}

export function getAbsPath(relativePath, importMeta) {
  return new URL(relativePath, importMeta.url);
}

export function clearDir(relativePath, importMeta) {
  const absPath = getAbsPath(relativePath, importMeta.url);
  if (fs.existsSync(absPath)) fs.rmSync(absPath, { recursive: true });
}

export function expectFileExists(importMeta, relPath) {
  const absPath = new URL(relPath, importMeta.url);
  assert(fs.existsSync(absPath), `Expected file to exist: ${relPath}`);
}

export function expectFileNotExists(importMeta, relPath) {
  const absPath = new URL(relPath, importMeta.url);
  assert(!fs.existsSync(absPath), `Expect file to not exist: ${relPath}`);
}
