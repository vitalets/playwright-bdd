import fs from 'node:fs';
import path from 'node:path';
import { logger } from './logger';

export function exitWithMessage(...messages: string[]) {
  logger.error('ERROR:', ...messages);
  process.exit(1);
}

// See: https://stackoverflow.com/questions/50453640/how-can-i-get-the-value-of-a-symbol-property
export function getSymbolByName<T extends object>(target: T, name?: string) {
  const ownKeys = Reflect.ownKeys(target);
  const symbol = ownKeys.find((key) => key.toString() === `Symbol(${name})`);
  if (!symbol) {
    throw new Error(`Symbol "${name}" not found in target. ownKeys: ${ownKeys}`);
  }
  return symbol as keyof T;
}

/**
 * Inserts params into template.
 * Params defined as <param>.
 */
export function template(t: string, params: Record<string, unknown> = {}) {
  return t.replace(/<(.+?)>/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Returns common path of files.
 * Example:
 * - '/foo/bar/1.txt'
 * - '/foo/bar/baz/2.txt'
 * => '/foo/bar'
 */
export function getCommonPath(filePaths: string[]) {
  return filePaths
    .reduce((commonPath: string[], filePath, index) => {
      const dirPath = path.dirname(filePath);
      const dirs = dirPath.split(path.sep);
      if (index === 0) return dirs;
      const stopIndex = commonPath.findIndex((dir, index) => dir !== dirs[index]);
      return stopIndex === -1 ? commonPath : commonPath.slice(0, stopIndex);
    }, [])
    .join(path.sep);
}

export function removeDuplicates(arr: string[]) {
  return [...new Set(arr)];
}

export function resolvePackageRoot(packageName: string) {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);
  return path.dirname(packageJsonPath);
}

export function getPackageVersion(packageName: string) {
  const packageRoot = resolvePackageRoot(packageName);
  const packageJsonPath = path.join(packageRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return (packageJson.version || '') as string;
}
