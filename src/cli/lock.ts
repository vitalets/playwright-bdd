/**
 * Serializes bddgen processes writing to the same output directory. Each process
 * exclusively creates an owner-tagged lock, waits for a live owner, removes stale
 * locks, and only removes a lock on release when its ownership token still matches.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import timers from 'node:timers/promises';
import { removeDuplicates } from '../utils';
import { logger } from '../utils/logger';
import { relativeToCwd } from '../utils/paths';

const LOCK_FILE_NAME = '.bddgen.lock';
const RETRY_INTERVAL_MS = 100;
const INVALID_LOCK_GRACE_MS = 1_000;

type LockOwner = {
  /** Time when the lock was acquired, preserved for diagnostics. */
  createdAt: number;
  /** Process ID used to determine whether the lock owner is still running. */
  pid: number;
  /** PID checks if the process is alive; token ensures we only remove the lock we created. */
  token: string;
};

type AcquiredLock = LockOwner & {
  lockPath: string;
};

type LockSnapshot = {
  content: string;
  mtimeMs: number;
  owner?: LockOwner;
};

export async function withLock<T>(outputDirs: string[], generate: () => Promise<T>) {
  const locks: AcquiredLock[] = [];
  const releaseOnExit = () => locks.forEach(releaseLockSync);
  process.once('exit', releaseOnExit);

  try {
    const normalizedOutputDirs = removeDuplicates(
      outputDirs.map((dir) => path.resolve(dir)),
    ).sort();
    for (const outputDir of normalizedOutputDirs) {
      locks.push(await acquireLock(outputDir));
    }
    return await generate();
  } finally {
    await releaseLocks(locks);
    process.removeListener('exit', releaseOnExit);
  }
}

async function acquireLock(outputDir: string) {
  await fs.promises.mkdir(outputDir, { recursive: true });
  const lockPath = path.join(outputDir, LOCK_FILE_NAME);
  const owner = {
    createdAt: Date.now(),
    pid: process.pid,
    token: crypto.randomUUID(),
  } satisfies LockOwner;
  await waitForLock(lockPath, outputDir, owner);
  return { ...owner, lockPath };
}

async function waitForLock(lockPath: string, outputDir: string, owner: LockOwner) {
  let waitingLogged = false;

  while (true) {
    if (await tryCreateLock(lockPath, owner)) return;
    if (await removeStaleLock(lockPath)) continue;
    if (!waitingLogged) {
      logWaiting(outputDir);
      waitingLogged = true;
    }
    await timers.setTimeout(RETRY_INTERVAL_MS);
  }
}

async function tryCreateLock(lockPath: string, owner: LockOwner) {
  try {
    await fs.promises.writeFile(lockPath, `${JSON.stringify(owner)}\n`, { flag: 'wx' });
    return true;
  } catch (error) {
    if (hasErrorCode(error, 'EEXIST')) return false;
    throw error;
  }
}

function logWaiting(outputDir: string) {
  logger.warn(
    `Another bddgen process is generating files in ${relativeToCwd(outputDir)}. Waiting...`,
  );
}

async function removeStaleLock(lockPath: string) {
  const snapshot = await readLockSnapshot(lockPath);
  if (!snapshot) return true;
  if (!isStaleLock(snapshot)) return false;
  return removeLockIfUnchanged(lockPath, snapshot);
}

async function removeLockIfUnchanged(lockPath: string, snapshot: LockSnapshot) {
  // Re-read ownership before removal so a newly acquired lock is not removed.
  const currentSnapshot = await readLockSnapshot(lockPath);
  if (!currentSnapshot || currentSnapshot.content !== snapshot.content) return !currentSnapshot;

  try {
    await fs.promises.rm(lockPath);
    logger.warn(`Removed stale bddgen lock: ${relativeToCwd(lockPath)}`);
    return true;
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return true;
    throw error;
  }
}

function isStaleLock(snapshot: LockSnapshot) {
  if (snapshot.owner) return !isProcessRunning(snapshot.owner.pid);
  return Date.now() - snapshot.mtimeMs >= INVALID_LOCK_GRACE_MS;
}

async function readLockSnapshot(lockPath: string): Promise<LockSnapshot | undefined> {
  try {
    const content = await fs.promises.readFile(lockPath, 'utf8');
    const { mtimeMs } = await fs.promises.stat(lockPath);
    return { content, mtimeMs, owner: parseLockOwner(content) };
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return;
    throw error;
  }
}

function parseLockOwner(content: string) {
  try {
    const owner: unknown = JSON.parse(content);
    return isLockOwner(owner) ? owner : undefined;
  } catch {
    // A process can observe the file between its exclusive creation and metadata write.
  }
}

function isLockOwner(value: unknown): value is LockOwner {
  if (value === null || typeof value !== 'object') return false;
  const owner = value as Partial<LockOwner>;
  return [
    typeof owner.pid === 'number',
    Number.isInteger(owner.pid),
    Number(owner.pid) > 0,
    typeof owner.createdAt === 'number',
    Number.isFinite(owner.createdAt),
    typeof owner.token === 'string',
  ].every(Boolean);
}

function isProcessRunning(pid: number) {
  if (pid === process.pid) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return hasErrorCode(error, 'EPERM');
  }
}

async function releaseLocks(locks: AcquiredLock[]) {
  for (const lock of locks.reverse()) {
    try {
      await releaseLock(lock);
    } catch (error) {
      logger.error(`Failed to release bddgen lock ${relativeToCwd(lock.lockPath)}:`, error);
    }
  }
}

async function releaseLock(lock: AcquiredLock) {
  const snapshot = await readLockSnapshot(lock.lockPath);
  if (snapshot?.owner?.token === lock.token) {
    await fs.promises.rm(lock.lockPath, { force: true });
  }
}

function releaseLockSync(lock: AcquiredLock) {
  try {
    const owner = parseLockOwner(fs.readFileSync(lock.lockPath, 'utf8'));
    if (owner?.token === lock.token) fs.rmSync(lock.lockPath, { force: true });
  } catch (error) {
    if (!hasErrorCode(error, 'ENOENT')) {
      logger.error(`Failed to release bddgen lock ${relativeToCwd(lock.lockPath)}:`, error);
    }
  }
}

function hasErrorCode(error: unknown, code: string) {
  return (error as NodeJS.ErrnoException)?.code === code;
}
