import fs from 'node:fs';
import path from 'node:path';
import {
  getExecutionLockPath,
  getGenerationLockPath,
  resolveLockDir,
} from '../../dist/lock-file/paths.js';
import {
  BDDGEN_CMD,
  execPlaywrightTest,
  expect,
  startProcess,
  test,
  TestDir,
  waitFor,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const projectDir = testDir.getAbsPath('.');
const testRunningFile = testDir.getAbsPath('test-running.txt');
const outputDir = '.features-gen';
const outputFile = `${outputDir}/sample.feature.spec.js`;
const notLockedOutputDir = '.features-gen-not-locked';
const notLockedOutputFile = `${notLockedOutputDir}/sample.feature.spec.js`;
const absOutputDir = testDir.getAbsPath(outputDir);
const lockDir = await resolveLockDir(absOutputDir);
const generationLock = getGenerationLockPath(lockDir);

test(`${testDir.name}: generation waits for execution to finish`, async () => {
  resetDirs();
  runBddgen();
  const testProcess = startTestExecution();

  try {
    await waitFor(() => fs.existsSync(testRunningFile));
    const initialMtime = fs.statSync(testDir.getAbsPath(outputFile)).mtimeMs;
    const bddgenProcess = startProcess(BDDGEN_CMD, {
      cwd: projectDir,
      env: { LOCK_FILE: 'true' },
    });
    try {
      await bddgenProcess.waitForOutput('BDD tests are executing in .features-gen. Waiting...');
      expect(fs.statSync(testDir.getAbsPath(outputFile)).mtimeMs).toBe(initialMtime);
      stopTestExecution();
      await testProcess.waitForExit();
      await bddgenProcess.waitForExit();
      expect(testProcess.exitCode).toBe(0);
      expect(bddgenProcess.exitCode).toBe(0);
    } finally {
      await bddgenProcess.stop();
    }
  } finally {
    await testProcess.stop();
    resetDirs();
  }
});

test(`${testDir.name}: execution waits for generation to finish`, async () => {
  resetDirs();
  runBddgen();
  createLockFile(generationLock);
  const testProcess = startTestExecution();

  try {
    await testProcess.waitForOutput('bddgen is generating files in .features-gen. Waiting...');
    expect(findExecutionLocks()).toEqual([]);
    expect(fs.existsSync(testRunningFile)).toBe(false);
    fs.rmSync(generationLock);
    await waitFor(() => fs.existsSync(testRunningFile));
    stopTestExecution();
    await testProcess.waitForExit();
    expect(testProcess.exitCode).toBe(0);
  } finally {
    await testProcess.stop();
    resetDirs();
  }
});

test(`${testDir.name}: clear-locks removes live current-project locks`, () => {
  resetDirs();
  const executionLock = getExecutionLockPath(lockDir, process.pid, 'deadbeef');
  createLockFile(generationLock);
  createLockFile(executionLock, { workerIndex: 0 });
  const unknownFile = path.join(lockDir, 'keep.txt');
  fs.writeFileSync(unknownFile, 'keep');

  try {
    const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} clear-locks`);
    expect(stdout).toContain('Warning: removed active lock generation.lock owned by PID');
    expect(stdout).toContain(`Cleared lock files for BDD output directories:\n- ${absOutputDir}`);
    expect(fs.existsSync(generationLock)).toBe(false);
    expect(fs.existsSync(executionLock)).toBe(false);
    expect(fs.existsSync(unknownFile)).toBe(true);
  } finally {
    resetDirs();
  }
});

test(`${testDir.name}: remove stale lock file`, () => {
  resetDirs();
  createLockFile(generationLock, { pid: 2_147_483_647 });
  try {
    execPlaywrightTest(testDir.name, {
      cmd: BDDGEN_CMD,
      env: { LOCK_FILE: 'true' },
    });
    testDir.expectFileExists(outputFile);
    expect(fs.existsSync(generationLock)).toBe(false);
  } finally {
    resetDirs();
  }
});

test(`${testDir.name}: execution of the project without lock file does not wait for locked configs`, async () => {
  resetDirs();
  createLockFile(generationLock);
  const bddgenProcess = startProcess(BDDGEN_CMD, {
    cwd: projectDir,
    env: {
      LOCK_FILE: 'true',
      EXTRA_NO_LOCK_PROJECT: 'true',
    },
  });

  try {
    await bddgenProcess.waitForOutput(
      // this message is causd by the first project, but not for the second
      'Another bddgen process is generating files in .features-gen. Waiting...',
    );
    testDir.expectFileExists(notLockedOutputFile);
    testDir.expectFileNotExist(outputFile);
    fs.rmSync(generationLock);
    await bddgenProcess.waitForExit();
    expect(bddgenProcess.exitCode).toBe(0);
    testDir.expectFileExists(outputFile);
  } finally {
    await bddgenProcess.stop();
    resetDirs();
  }
});

function runBddgen() {
  execPlaywrightTest(testDir.name, BDDGEN_CMD);
}

function startTestExecution() {
  return startProcess('npx playwright test', {
    cwd: projectDir,
    env: { LOCK_FILE: 'true' },
  });
}

function stopTestExecution() {
  fs.rmSync(testRunningFile);
}

function createLockFile(lockPath, overrides = {}) {
  const owner = { createdAt: Date.now(), pid: process.pid, token: 'test-lock', ...overrides };
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  fs.writeFileSync(lockPath, JSON.stringify(owner));
}

function findExecutionLocks() {
  if (!fs.existsSync(lockDir)) return [];
  return fs.readdirSync(lockDir).filter((file) => file.startsWith('execution.'));
}

function resetDirs() {
  testDir.clearDir(outputDir);
  testDir.clearDir(notLockedOutputDir);
  testDir.clearDir('test-results');
  fs.rmSync(testRunningFile, { force: true });
  fs.rmSync(lockDir, { recursive: true, force: true });
}
