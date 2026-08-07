import fs from 'node:fs';
import path from 'node:path';
import { removeDuplicates } from '../../utils';
import { isPathInside } from '../../utils/paths';
import { WatchMetadata } from './ipc';

type WatchPaths = {
  ignoredPaths: string[];
  roots: string[];
};

export function resolveWatchPaths({
  packageRoot: includePackageRoot,
  include,
  exclude,
  featurePatterns,
  stepPatterns,
  importTestFromFiles,
  outputDirs,
  resolvedConfigFile,
}: WatchMetadata): WatchPaths {
  const configDir = path.dirname(resolvedConfigFile);
  const packageRoot = findNearestPackageRoot(configDir) ?? configDir;
  const featureDirs = featurePatterns.map(findNearestExistingDirectory);
  const stepDirs = stepPatterns.map(findNearestExistingDirectory);
  const dependencyRoots = minimizePaths([...(includePackageRoot ? [packageRoot] : []), ...include]);
  const roots = minimizePaths(
    [
      resolvedConfigFile,
      ...featureDirs,
      ...stepDirs,
      ...importTestFromFiles.map(findNearestExistingPath),
      ...dependencyRoots,
    ].map((watchPath) => findNearestExistingPath(path.resolve(watchPath))),
  );
  return {
    roots,
    ignoredPaths: minimizePaths([...outputDirs, ...exclude]),
  };
}

function findNearestPackageRoot(configDir: string) {
  let currentDir = configDir;
  while (true) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) return currentDir;
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) return;
    currentDir = parentDir;
  }
}

function findNearestExistingPath(candidate: string) {
  let currentPath = candidate;
  while (!fs.existsSync(currentPath)) {
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) return currentPath;
    currentPath = parentPath;
  }
  return currentPath;
}

function findNearestExistingDirectory(candidate: string) {
  let currentPath = candidate;
  while (true) {
    if (fs.existsSync(currentPath) && fs.statSync(currentPath).isDirectory()) return currentPath;
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) return currentPath;
    currentPath = parentPath;
  }
}

function minimizePaths(candidates: string[]) {
  const paths: string[] = [];
  const sortedCandidates = removeDuplicates(candidates.map(canonicalizePath)).sort(
    (a, b) => a.length - b.length,
  );
  sortedCandidates.forEach((candidate) => {
    if (!paths.some((parent) => isPathInside(parent, candidate))) paths.push(candidate);
  });
  return paths;
}

/**
 * Canonicalizes Windows paths without requiring the complete path to exist.
 *
 * @example
 * canonicalizePath('C:\\Users\\RUNNER~1\\AppData\\Local\\Temp');
 * // => 'C:\\Users\\runneradmin\\AppData\\Local\\Temp'
 *
 * Node 24.16+ with libuv 1.52.1 can abort inside `fs.watch()` when the watched directory
 * contains an 8.3 short-name segment. Canonicalizing both watch roots and ignored paths keeps
 * their path representations consistent and avoids the native assertion.
 * See: https://github.com/nodejs/node/issues/63638
 * See: https://github.com/libuv/libuv/issues/5010
 * Fix: https://github.com/libuv/libuv/pull/5152
 */
function canonicalizePath(candidate: string) {
  const absolutePath = path.resolve(candidate);
  if (process.platform !== 'win32') return absolutePath;

  const existingPath = findNearestExistingPath(absolutePath);
  const canonicalExistingPath = fs.realpathSync.native(existingPath);
  return path.resolve(canonicalExistingPath, path.relative(existingPath, absolutePath));
}
