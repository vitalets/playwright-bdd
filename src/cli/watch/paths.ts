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
  extraPaths,
  ignorePaths,
  outputDirs,
  resolvedConfigFile,
}: WatchMetadata): WatchPaths {
  const configDir = path.dirname(resolvedConfigFile);
  const packageRoot = findNearestPackageRoot(configDir) ?? configDir;
  const roots = minimizePaths(
    [packageRoot, ...extraPaths].map((watchPath) =>
      findNearestExistingPath(path.resolve(watchPath)),
    ),
  );
  return {
    roots,
    ignoredPaths: minimizePaths([...outputDirs, ...ignorePaths]),
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

function minimizePaths(candidates: string[]) {
  const paths: string[] = [];
  const sortedCandidates = removeDuplicates(
    candidates.map((candidate) => path.resolve(candidate)),
  ).sort((a, b) => a.length - b.length);
  sortedCandidates.forEach((candidate) => {
    if (!paths.some((parent) => isPathInside(parent, candidate))) paths.push(candidate);
  });
  return paths;
}
