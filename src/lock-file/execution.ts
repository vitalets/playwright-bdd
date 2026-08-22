import timers from 'node:timers/promises';
import { logger } from '../utils/logger';
import { relativeToCwd } from '../utils/paths';
import {
  ensureLockDir,
  getExecutionLockPath,
  getGenerationLockPath,
  removeLockDirIfEmpty,
  resolveLockDir,
} from './paths';
import {
  createLockOwner,
  readLockSnapshot,
  releaseOwnedLock,
  releaseOwnedLockSync,
  removeStaleLock,
  tryCreateLock,
} from './owner';
import { RETRY_INTERVAL_MS } from './const';

type WorkerInfo = { workerIndex: number };

export async function withExecutionLock<T>(
  outputDir: string,
  workerInfo: WorkerInfo,
  execute: () => Promise<T>,
) {
  const lock = await acquireExecutionLock(outputDir, workerInfo.workerIndex);
  const releaseOnExit = () => releaseOwnedLockSync(lock.lockPath, lock.token);
  process.once('exit', releaseOnExit);
  try {
    return await execute();
  } finally {
    await releaseOwnedLock(lock.lockPath, lock.token);
    process.removeListener('exit', releaseOnExit);
    await removeLockDirIfEmpty(lock.lockDir);
  }
}

async function acquireExecutionLock(outputDir: string, workerIndex: number) {
  const { lockDir, lockPath, owner } = await createExecutionLockInfo(outputDir, workerIndex);
  let waitingLogged = false;
  while (true) {
    await ensureLockDir(lockDir);
    if (!(await tryCreateLock(lockPath, owner))) continue;
    if (!(await hasGenerationLock(lockDir))) return { ...owner, lockDir, lockPath, outputDir };
    await releaseOwnedLock(lockPath, owner.token);
    if (!waitingLogged) {
      logger.warn(`bddgen is generating files in ${relativeToCwd(outputDir)}. Waiting...`);
      waitingLogged = true;
    }
    await waitForGeneration(lockDir);
  }
}

async function createExecutionLockInfo(outputDir: string, workerIndex: number) {
  const lockDir = await resolveLockDir(outputDir);
  const owner = createLockOwner(workerIndex);
  const lockPath = getExecutionLockPath(lockDir, owner.pid, owner.token);
  return { lockDir, lockPath, owner };
}

async function hasGenerationLock(lockDir: string): Promise<boolean> {
  const lockPath = getGenerationLockPath(lockDir);
  if (!(await readLockSnapshot(lockPath))) return false;
  if (await removeStaleLock(lockPath)) return hasGenerationLock(lockDir);
  return true;
}

async function waitForGeneration(lockDir: string) {
  while (await hasGenerationLock(lockDir)) {
    await timers.setTimeout(RETRY_INTERVAL_MS);
  }
}
