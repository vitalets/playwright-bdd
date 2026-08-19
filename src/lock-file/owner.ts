import crypto from 'node:crypto';
import fs from 'node:fs';
import { logger } from '../utils/logger';
import { INVALID_LOCK_GRACE_MS, LockOwner, LockSnapshot } from './types';

export function createLockOwner(workerIndex?: number): LockOwner {
  return {
    createdAt: Date.now(),
    pid: process.pid,
    token: crypto.randomUUID(),
    ...(workerIndex === undefined ? {} : { workerIndex }),
  };
}

export async function tryCreateLock(lockPath: string, owner: LockOwner) {
  try {
    await fs.promises.writeFile(lockPath, `${JSON.stringify(owner)}\n`, { flag: 'wx' });
    return true;
  } catch (error) {
    // The namespace can be removed concurrently after ensureLockDir(); retry in the caller.
    if (hasErrorCode(error, 'EEXIST') || hasErrorCode(error, 'ENOENT')) return false;
    throw error;
  }
}

export async function removeStaleLock(lockPath: string) {
  const snapshot = await readLockSnapshot(lockPath);
  if (!snapshot) return true;
  if (!isStaleLock(snapshot)) return false;
  return removeLockIfUnchanged(lockPath, snapshot);
}

export async function readLockSnapshot(lockPath: string): Promise<LockSnapshot | undefined> {
  try {
    const content = await fs.promises.readFile(lockPath, 'utf8');
    const { mtimeMs } = await fs.promises.stat(lockPath);
    return { content, mtimeMs, owner: parseLockOwner(content) };
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return;
    throw error;
  }
}

export function parseLockOwner(content: string) {
  try {
    const owner: unknown = JSON.parse(content);
    return isLockOwner(owner) ? owner : undefined;
  } catch {
    // A process can observe the file between its exclusive creation and metadata write.
  }
}

export function isProcessRunning(pid: number) {
  if (pid === process.pid) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return hasErrorCode(error, 'EPERM');
  }
}

export async function releaseOwnedLock(lockPath: string, token: string) {
  const snapshot = await readLockSnapshot(lockPath);
  if (snapshot?.owner?.token === token) await fs.promises.rm(lockPath, { force: true });
}

export function releaseOwnedLockSync(lockPath: string, token: string) {
  try {
    const owner = parseLockOwner(fs.readFileSync(lockPath, 'utf8'));
    if (owner?.token === token) fs.rmSync(lockPath, { force: true });
  } catch (error) {
    if (!hasErrorCode(error, 'ENOENT')) logger.error(`Failed to release lock ${lockPath}:`, error);
  }
}

export function hasErrorCode(error: unknown, code: string) {
  return (error as NodeJS.ErrnoException)?.code === code;
}

function isStaleLock(snapshot: LockSnapshot) {
  if (snapshot.owner) return !isProcessRunning(snapshot.owner.pid);
  return Date.now() - snapshot.mtimeMs >= INVALID_LOCK_GRACE_MS;
}

async function removeLockIfUnchanged(lockPath: string, snapshot: LockSnapshot) {
  const currentSnapshot = await readLockSnapshot(lockPath);
  if (!currentSnapshot || currentSnapshot.content !== snapshot.content) return !currentSnapshot;
  try {
    await fs.promises.rm(lockPath);
    logger.warn(`Removed stale playwright-bdd lock: ${lockPath}`);
    return true;
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return true;
    throw error;
  }
}

function isLockOwner(value: unknown): value is LockOwner {
  if (value === null || typeof value !== 'object') return false;
  const owner = value as Partial<LockOwner>;
  return isBaseLockOwner(owner) && isValidWorkerIndex(owner.workerIndex);
}

function isBaseLockOwner(owner: Partial<LockOwner>) {
  return [
    typeof owner.pid === 'number',
    Number.isInteger(owner.pid),
    Number(owner.pid) > 0,
    typeof owner.createdAt === 'number',
    Number.isFinite(owner.createdAt),
    typeof owner.token === 'string',
  ].every(Boolean);
}

function isValidWorkerIndex(workerIndex: unknown) {
  return (
    workerIndex === undefined || (typeof workerIndex === 'number' && Number.isInteger(workerIndex))
  );
}
