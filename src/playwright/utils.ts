import path from 'path';

const playwrightRoot = path.dirname(require.resolve('@playwright/test'));

/**
 * Requires Playwright's internal module that is not exported via package.exports.
 */
export function requirePlaywrightModule(modulePath: string) {
  const absPath = path.isAbsolute(modulePath) ? modulePath : getPlaywrightModulePath(modulePath);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(absPath);
}

export function getPlaywrightModulePath(relativePath: string) {
  const parts = relativePath.split('/');
  return path.join(playwrightRoot, ...parts);
}
