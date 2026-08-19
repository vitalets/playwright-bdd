import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EXECUTION_LOCK_RE, GENERATION_LOCK_FILE } from './types';

export async function resolveLockDir(outputDir: string) {
  const canonicalOutputDir = await canonicalizeOutputDir(outputDir);
  const outputHash = crypto.createHash('sha256').update(canonicalOutputDir).digest('hex');
  return path.join(getLockRootDir(), outputHash);
}

export function getGenerationLockPath(lockDir: string) {
  return path.join(lockDir, GENERATION_LOCK_FILE);
}

export function getExecutionLockPath(lockDir: string, pid: number, token: string) {
  return path.join(lockDir, `execution.${pid}-${token}.lock`);
}

export function isExecutionLockFile(fileName: string) {
  return EXECUTION_LOCK_RE.test(fileName);
}

export async function ensureLockDir(lockDir: string) {
  await fs.promises.mkdir(lockDir, { recursive: true, mode: 0o700 });
}

export async function removeLockDirIfEmpty(lockDir: string) {
  try {
    await fs.promises.rmdir(lockDir);
  } catch (error) {
    if (!hasErrorCode(error, 'ENOENT') && !hasErrorCode(error, 'ENOTEMPTY')) throw error;
  }
}

function getLockRootDir() {
  const userId = process.getuid?.() ?? 'user';
  return path.join(os.tmpdir(), `playwright-bdd-${userId}`);
}

async function canonicalizeOutputDir(outputDir: string) {
  const resolvedOutputDir = path.resolve(outputDir);
  let canonicalOutputDir = resolvedOutputDir;
  try {
    canonicalOutputDir = await fs.promises.realpath(resolvedOutputDir);
  } catch (error) {
    if (!hasErrorCode(error, 'ENOENT')) throw error;
  }
  const normalized = path.normalize(canonicalOutputDir);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function hasErrorCode(error: unknown, code: string) {
  return (error as NodeJS.ErrnoException)?.code === code;
}
