import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findNearestExistingPath } from '../utils/paths';
import { EXECUTION_LOCK_RE, GENERATION_LOCK_FILE } from './const';

/**
 * Maps an output directory to a shared lock directory under the OS temp directory.
 * Canonical paths make aliases share one lock, hashing produces a safe fixed-length name,
 * and keeping locks outside the generated output prevents generation cleanup from deleting them.
 */
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
  // Lock files may live under shared /tmp, so restrict the namespace to the current user.
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

/**
 * Resolves symlinks and Windows path aliases using the nearest existing parent,
 * so an output directory maps to the same lock path before and after it is created.
 *
 * @example Missing output directory below a symlink:
 * canonicalizeOutputDir('/linked-project/.features-gen');
 * // => '/real-project/.features-gen'
 *
 * @example Windows 8.3 path alias:
 * canonicalizeOutputDir('C:\\Users\\RUNNER~1\\project\\.features-gen');
 * // => 'c:\\users\\runneradmin\\project\\.features-gen'
 */
async function canonicalizeOutputDir(outputDir: string) {
  const resolvedOutputDir = path.resolve(outputDir);
  // realpath() requires the complete path to exist, but the output directory often does not.
  // Resolve its nearest existing parent and append the missing path segments instead.
  const existingPath = findNearestExistingPath(resolvedOutputDir);
  const canonicalExistingPath = await fs.promises.realpath(existingPath);
  const canonicalOutputDir = path.resolve(
    canonicalExistingPath,
    path.relative(existingPath, resolvedOutputDir),
  );
  const normalized = path.normalize(canonicalOutputDir);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function hasErrorCode(error: unknown, code: string) {
  return (error as NodeJS.ErrnoException)?.code === code;
}
