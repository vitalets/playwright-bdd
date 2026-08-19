import fs from 'node:fs';
import path from 'node:path';
import { removeDuplicates } from '../utils';
import { hasErrorCode, isProcessRunning, readLockSnapshot } from './owner';
import { isExecutionLockFile, removeLockDirIfEmpty, resolveLockDir } from './paths';
import { GENERATION_LOCK_FILE, LockOwner } from './types';

export type ClearedLock = {
  lockPath: string;
  owner?: LockOwner;
  wasActive: boolean;
};

export async function clearLockFiles(outputDirs: string[]) {
  const lockDirs = await Promise.all(removeDuplicates(outputDirs).map(resolveLockDir));
  const clearedLocks = await Promise.all(lockDirs.map(clearLockDir));
  return clearedLocks.flat();
}

async function clearLockDir(lockDir: string) {
  const lockPaths = await getKnownLockPaths(lockDir);
  const clearedLocks: ClearedLock[] = [];
  for (const lockPath of lockPaths) {
    const clearedLock = await clearLock(lockPath);
    if (clearedLock) clearedLocks.push(clearedLock);
  }
  await removeLockDirIfEmpty(lockDir);
  return clearedLocks;
}

async function getKnownLockPaths(lockDir: string) {
  try {
    const files = await fs.promises.readdir(lockDir);
    return files.filter(isKnownLockFile).map((file) => path.join(lockDir, file));
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return [];
    throw error;
  }
}

function isKnownLockFile(fileName: string) {
  return fileName === GENERATION_LOCK_FILE || isExecutionLockFile(fileName);
}

async function clearLock(lockPath: string): Promise<ClearedLock | undefined> {
  const snapshot = await readLockSnapshot(lockPath);
  try {
    await fs.promises.rm(lockPath);
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return;
    throw error;
  }
  const owner = snapshot?.owner;
  return { lockPath, owner, wasActive: owner ? isProcessRunning(owner.pid) : false };
}
