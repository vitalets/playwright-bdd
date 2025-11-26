import path from 'node:path';
import { getPackageVersion, resolvePackageRoot } from '../utils';

// cache playwright root
let playwrightRoot = '';

export const playwrightVersion = getPackageVersion('@playwright/test');

/**
 * Requires Playwright's internal module that is not exported via package.exports.
 */
export function requirePlaywrightModule(modulePath: string) {
  const absPath = path.isAbsolute(modulePath) ? modulePath : getPlaywrightModulePath(modulePath);
  return require(absPath);
}

/**
 * Not used now. Kept for potential use.
 * @public
 */
export function getPlaywrightModulePath(relativePath: string) {
  return path.join(getPlaywrightRoot(), relativePath);
}

function getPlaywrightRoot() {
  if (!playwrightRoot) {
    playwrightRoot = resolvePackageRoot('playwright');
  }

  return playwrightRoot;
}
