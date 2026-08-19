import fs from 'node:fs';
import path from 'node:path';
import timers from 'node:timers/promises';
import { removeDuplicates } from '../utils';
import { logger } from '../utils/logger';
import { relativeToCwd } from '../utils/paths';
import {
  ensureLockDir,
  getGenerationLockPath,
  isExecutionLockFile,
  removeLockDirIfEmpty,
  resolveLockDir,
} from './paths';
import {
  createLockOwner,
  hasErrorCode,
  releaseOwnedLock,
  releaseOwnedLockSync,
  removeStaleLock,
  tryCreateLock,
} from './owner';
import { AcquiredLock, RETRY_INTERVAL_MS } from './types';

export async function withGenerationLock<T>(outputDirs: string[], generate: () => Promise<T>) {
  const locks: AcquiredLock[] = [];
  const releaseOnExit = () => locks.forEach(releaseGenerationLockSync);
  process.once('exit', releaseOnExit);
  try {
    for (const outputDir of normalizeOutputDirs(outputDirs)) {
      locks.push(await acquireGenerationLock(outputDir));
    }
    await Promise.all(locks.map(waitForExecutionLocks));
    return await generate();
  } finally {
    await releaseGenerationLocks(locks);
    process.removeListener('exit', releaseOnExit);
  }
}

function normalizeOutputDirs(outputDirs: string[]) {
  return removeDuplicates(outputDirs.map((dir) => path.resolve(dir))).sort();
}

async function acquireGenerationLock(outputDir: string) {
  const lockDir = await resolveLockDir(outputDir);
  const lockPath = getGenerationLockPath(lockDir);
  const owner = createLockOwner();
  let waitingLogged = false;
  while (true) {
    await ensureLockDir(lockDir);
    if (await tryCreateLock(lockPath, owner)) return { ...owner, lockDir, lockPath, outputDir };
    if (await removeStaleLock(lockPath)) continue;
    if (!waitingLogged) {
      logger.warn(
        `Another bddgen process is generating files in ${relativeToCwd(outputDir)}. Waiting...`,
      );
      waitingLogged = true;
    }
    await timers.setTimeout(RETRY_INTERVAL_MS);
  }
}

async function waitForExecutionLocks(lock: AcquiredLock) {
  let waitingLogged = false;
  while (true) {
    const activeLocks = await getActiveExecutionLocks(lock.lockDir);
    if (activeLocks === 0) return;
    if (!waitingLogged) {
      logger.warn(`BDD tests are executing in ${relativeToCwd(lock.outputDir)}. Waiting...`);
      waitingLogged = true;
    }
    await timers.setTimeout(RETRY_INTERVAL_MS);
  }
}

async function getActiveExecutionLocks(lockDir: string) {
  const lockPaths = await getExecutionLockPaths(lockDir);
  const active = await Promise.all(lockPaths.map(isActiveLock));
  return active.filter(Boolean).length;
}

async function getExecutionLockPaths(lockDir: string) {
  try {
    const files = await fs.promises.readdir(lockDir);
    return files.filter(isExecutionLockFile).map((file) => path.join(lockDir, file));
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return [];
    throw error;
  }
}

async function isActiveLock(lockPath: string) {
  return !(await removeStaleLock(lockPath));
}

async function releaseGenerationLocks(locks: AcquiredLock[]) {
  for (const lock of locks.reverse()) await releaseGenerationLock(lock);
}

async function releaseGenerationLock(lock: AcquiredLock) {
  try {
    await releaseOwnedLock(lock.lockPath, lock.token);
    await removeLockDirIfEmpty(lock.lockDir);
  } catch (error) {
    logger.error(`Failed to release bddgen lock ${lock.lockPath}:`, error);
  }
}

function releaseGenerationLockSync(lock: AcquiredLock) {
  releaseOwnedLockSync(lock.lockPath, lock.token);
}
