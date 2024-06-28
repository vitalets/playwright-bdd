import path from 'node:path';
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
  return fg.glob(finalPatterns, { cwd, absolute: true, dot: true });
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
