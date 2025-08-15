import path from 'node:path';
import fs from 'node:fs';
import fg from 'fast-glob';

/**
 * Returns path with "/" separator on all platforms.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/utils/fileUtils.ts#L56
 * See: https://stackoverflow.com/questions/53799385/how-can-i-convert-a-windows-path-to-posix-path-using-node-path
 */
export function toPosixPath(somePath: string) {
  return somePath.split(path.sep).join(path.posix.sep);
}

/**
 * Returns path relative to cwd.
 */
export function relativeToCwd(absPath: string) {
  return path.isAbsolute(absPath) ? path.relative(process.cwd(), absPath) : absPath;
}

/**
 * Resolves patterns to list of files.
 * Extension can be a list: {js,ts}
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/paths/paths.ts
 */
export async function resolveFiles(cwd: string, patterns: string[], extension: string) {
  const finalPatterns = patterns.map((pattern) => finalizePattern(pattern, extension));
  const files = await fg.glob(finalPatterns, { cwd, absolute: true, dot: true });
  return { files, finalPatterns };
}

/**
 * Appends file extension(s) to pattern.
 * Example: 'path/to/dir' -> 'path/to/dir/** /*.{js,ts}'
 * @public
 */
export function finalizePattern(pattern: string, extension: string) {
  // On Windows convert path to forward slash.
  // Note: pattern must always use forward slash "/",
  // but directory can be resolved dynamically via path.xxx methods
  // that return backslash on Windows.
  if (path.sep === '\\') pattern = toPosixPath(pattern);
  switch (true) {
    case pattern.endsWith('**'):
      return `${pattern}/*.${extension}`;
    case pattern.endsWith('*'):
      return `${pattern}.${extension}`;
    case path.extname(pattern) === '':
      return `${pattern.replace(/\/+$/, '')}/**/*.${extension}`;
    default:
      return pattern;
  }
}

// See: https://github.com/microsoft/playwright/blob/6f16b6cc08f7d59a079d9afa67afacc321a37675/packages/playwright-core/src/utils/fileUtils.ts#L55
export function sanitizeForFilePath(s: string) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\x00-\x2C\x2E-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]+/g, '-');
}

// See: https://github.com/microsoft/playwright/blob/0fd94521279cfe5e02d1221242a7bf8d001119f0/packages/playwright-core/src/utils/fileUtils.ts#L50
export async function copyFileAndMakeWritable(from: string, to: string) {
  await fs.promises.copyFile(from, to);
  await fs.promises.chmod(to, 0o664);
}

export function isDirectory(directoryPath: string) {
  try {
    const stats = fs.statSync(directoryPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Identifies based on filepath whether a directory is a part of node_modules.
 * Intended for use with extractTagsFromPath to prevent including path names containing '@' that aren't test tags.
 * See: https://github.com/vitalets/playwright-bdd/blob/main/src/steps/tags.ts
 */
export function belongsToNodeModules(filePath: string) {
  return (
    filePath.startsWith(`node_modules${path.sep}`) ||
    filePath.includes(`${path.sep}node_modules${path.sep}`)
  );
}
