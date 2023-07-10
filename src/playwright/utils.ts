import path from 'path';

const playwrightRoot = path.dirname(require.resolve('@playwright/test'));

/**
 * Requires Playwright's internal module that is not exported via package.exports.
 */
export function requirePlaywrightModule(relativePath: string) {
  const parts = relativePath.split('/');
  const absPath = path.join(playwrightRoot, ...parts);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(absPath);
}
