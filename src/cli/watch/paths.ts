import fs from 'node:fs';
import path from 'node:path';
import { BDDConfig } from '../../config/types';
import { removeDuplicates, toArray } from '../../utils';
import { arraysEqual } from '../../utils/array';
import { isDirectory, isPathInside } from '../../utils/paths';
import { areGitIgnoresEqual, GitIgnore, loadGitIgnore } from './gitIgnore';
import type { WatchMetadata } from './ipc';

type WatchPaths = {
  /** Normalized file extensions that trigger regeneration. */
  extensions: string[];
  /** Generated output and user-excluded paths that Chokidar must ignore. */
  ignoredPaths: string[];
  /** Config, importTestFrom, and directly included files watched regardless of extension. */
  directFilesToWatch: string[];
  /** Minimal set of files and directories passed to Chokidar as watch targets. */
  roots: string[];
  /** Git-ignore files and their parsed matchers. */
  gitIgnores: GitIgnore[];
};

type WatchPathContext = {
  includedPaths: string[];
  packageRoot: string;
  gitIgnoreFiles: string[];
};

export function resolveWatchPaths(metadata: WatchMetadata): WatchPaths {
  const includedPaths = metadata.include.map(canonicalizePath);
  const configDir = path.dirname(metadata.resolvedConfigFile);
  const packageRoot = findNearestPackageRoot(configDir) ?? configDir;
  const gitIgnoreFiles = resolveGitIgnoreFiles(metadata, packageRoot);
  const context = { includedPaths, packageRoot, gitIgnoreFiles };
  return {
    extensions: metadata.extensions,
    roots: resolveWatchRoots(metadata, context),
    ignoredPaths: minimizePaths([...metadata.outputDirs, ...metadata.exclude]),
    directFilesToWatch: resolveDirectFilesToWatch(metadata, includedPaths, gitIgnoreFiles),
    gitIgnores: gitIgnoreFiles.map(loadGitIgnore),
  };
}

export function areWatchPathsEqual(current: WatchPaths | undefined, next: WatchPaths) {
  if (!current) return false;
  return [
    arraysEqual(current.roots, next.roots),
    arraysEqual(current.ignoredPaths, next.ignoredPaths),
    arraysEqual(current.directFilesToWatch, next.directFilesToWatch),
    arraysEqual(current.extensions, next.extensions),
    areGitIgnoresEqual(current.gitIgnores, next.gitIgnores),
  ].every(Boolean);
}

export function resolveWatchPatterns(configs: BDDConfig[], key: 'features' | 'steps') {
  return removeDuplicates(
    configs.flatMap((config) =>
      toArray(config[key]).map((pattern) => path.resolve(config.configDir, pattern)),
    ),
  );
}

function resolveDirectFilesToWatch(
  metadata: WatchMetadata,
  includedPaths: string[],
  gitIgnoreFiles: string[],
) {
  return removeDuplicates(
    [
      metadata.resolvedConfigFile,
      ...metadata.importTestFromFiles,
      ...includedPaths.filter((file) => !isDirectory(file)),
      ...gitIgnoreFiles,
    ].map(canonicalizePath),
  );
}

function resolveWatchRoots(metadata: WatchMetadata, context: WatchPathContext) {
  const { includedPaths, packageRoot, gitIgnoreFiles } = context;
  const dependencyRoots = minimizePaths([
    ...(metadata.packageRoot ? [packageRoot] : []),
    ...includedPaths,
  ]);
  return minimizePaths(
    [
      metadata.resolvedConfigFile,
      ...metadata.featurePatterns.map(findNearestExistingDirectory),
      ...metadata.stepPatterns.map(findNearestExistingDirectory),
      ...metadata.importTestFromFiles.map(findNearestExistingPath),
      ...dependencyRoots,
      ...gitIgnoreFiles,
    ].map((watchPath) =>
      gitIgnoreFiles.includes(watchPath)
        ? path.resolve(watchPath)
        : findNearestExistingPath(path.resolve(watchPath)),
    ),
  );
}

function resolveGitIgnoreFiles(metadata: WatchMetadata, packageRoot: string) {
  return removeDuplicates(
    metadata.gitIgnore
      .filter((value) => value !== false)
      .map((value) =>
        canonicalizePath(value === true ? path.join(packageRoot, '.gitignore') : value),
      ),
  );
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
