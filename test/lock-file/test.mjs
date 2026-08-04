import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { BDDGEN_CMD, execPlaywrightTest, expect, test, TestDir } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const lockFileDir = testDir.getAbsPath('.');
const outputDir = '.features-gen';
const outputFile = `${outputDir}/sample.feature.spec.js`;
const lockFile = `${outputDir}/.bddgen.lock`;
const WAITING_MESSAGE = 'Another bddgen process is generating files';

test(`${testDir.name}: bddgen waits for another process to finish`, async () => {
  testDir.clearDir(outputDir);
  createLockFile();
  const bddgenProcess = startBddgenProcess();

  try {
    await bddgenProcess.waitForOutput(WAITING_MESSAGE);
    testDir.expectFileNotExist(outputFile);

    fs.rmSync(testDir.getAbsPath(lockFile));
    await bddgenProcess.waitForExit();

    expect(bddgenProcess.exitCode).toBe(0);
    testDir.expectFileExists(outputFile);
    testDir.expectFileNotExist(lockFile);
  } finally {
    await bddgenProcess.stop();
    testDir.clearDir(outputDir);
  }
});

test(`${testDir.name} (recovers stale lock)`, () => {
  testDir.clearDir(outputDir);
  const PID_THAT_DOES_NOT_EXIST = 2_147_483_647;
  createLockFile({ pid: PID_THAT_DOES_NOT_EXIST });

  try {
    execPlaywrightTest(testDir.name, BDDGEN_CMD);
    testDir.expectFileExists(outputFile);
    testDir.expectFileNotExist(lockFile);
  } finally {
    testDir.clearDir(outputDir);
  }
});

test(`${testDir.name} (disabled)`, () => {
  testDir.clearDir(outputDir);
  createLockFile();

  try {
    // Disabled locking bypasses both lock creation and checks of an existing lock.
    execPlaywrightTest(testDir.name, {
      cmd: BDDGEN_CMD,
      env: { BDDGEN_TEST_LOCK_FILE: 'false' },
    });
    testDir.expectFileExists(outputFile);
    testDir.expectFileExists(lockFile);
  } finally {
    testDir.clearDir(outputDir);
  }
});

function createLockFile({ pid = process.pid } = {}) {
  testDir.writeFile(lockFile, JSON.stringify({ createdAt: Date.now(), pid, token: 'test-lock' }));
}

function startBddgenProcess() {
  const [command, ...args] = BDDGEN_CMD.split(' ');
  const child = spawn(command, args, {
    cwd: lockFileDir,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => (output += chunk));
  child.stderr.on('data', (chunk) => (output += chunk));

  return {
    get exitCode() {
      return child.exitCode;
    },
    async waitForOutput(expected) {
      await waitFor(() => {
        if (output.includes(expected)) return true;
        if (child.exitCode !== null) throw new Error(`bddgen exited.\n${output}`);
        return false;
      });
    },
    async waitForExit() {
      if (child.exitCode === null) {
        await new Promise((resolve) => child.once('exit', resolve));
      }
    },
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => child.once('exit', resolve));
    },
  };
}

async function waitFor(predicate, timeout = 10_000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeout) throw new Error(`Timed out waiting.\n${predicate}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
