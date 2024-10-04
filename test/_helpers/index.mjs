/**
 * Test helpers.
 */
import { normalize } from 'node:path';
import test from 'node:test';
import fs from 'node:fs';
import { expect } from '@playwright/test';

export * from './runPlaywright.mjs';
export * from './TestDir.mjs';

export { test, expect, normalize };
export const playwrightVersion = getPackageVersion('@playwright/test');

export function getPackageVersion(pkg) {
  const packageJsonPath = `node_modules/${pkg}/package.json`;
  if (!fs.existsSync(packageJsonPath)) return '';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version || '';
}
