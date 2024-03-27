import fs from 'node:fs';
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(absPath);
}

export function getPlaywrightModulePath(relativePath: string) {
  return path.join(getPlaywrightRoot(), relativePath);
}

function getPlaywrightRoot() {
  if (!playwrightRoot) {
    // Since 1.38 all modules moved from @playwright/test to playwright.
    // Here we check existance of 'lib' dir instead of checking version.
    // See: https://github.com/microsoft/playwright/pull/26946
    const playwrightTestRoot = resolvePackageRoot('@playwright/test');
    const libDir = path.join(playwrightTestRoot, 'lib');
    playwrightRoot = fs.existsSync(libDir) ? playwrightTestRoot : resolvePackageRoot('playwright');
  }

  return playwrightRoot;
}
