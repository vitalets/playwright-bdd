/**
 * Test helpers.
 */
import path, { normalize } from 'node:path';
import test from 'node:test';
import fs from 'node:fs';
import xml2js from 'xml2js';
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

export async function getJsonFromXmlFile(file) {
  const xml = fs.readFileSync(file, 'utf8');
  return xml2js.parseStringPromise(xml);
}

/**
 * Returns path with "/" separator on all platforms.
 * See: https://stackoverflow.com/questions/53799385/how-can-i-convert-a-windows-path-to-posix-path-using-node-path
 */
export function toPosixPath(somePath) {
  return somePath.split(path.sep).join(path.posix.sep);
}
