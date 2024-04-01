/**
 * Test helpers.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import fs from 'node:fs';
import xml2js from 'xml2js';

export * from './runPlaywright.mjs';
export * from './TestDir.mjs';

export { test };
export const playwrightVersion = getPackageVersion('@playwright/test');

/**
 * Test name = test dir from 'test/<xxx>/test.mjs'
 */
export function getTestName(importMeta) {
  return importMeta.url.split('/').slice(-2)[0];
}

export function getPackageVersion(pkg) {
  const { version } = JSON.parse(fs.readFileSync(`node_modules/${pkg}/package.json`, 'utf8'));

  return version;
}

export function ensureNodeVersion(version) {
  if (!process.version.startsWith(`v${version}.`)) {
    throw new Error(`Expected node version: ${version}`);
  }
}

export function getAbsPath(relativePath, importMeta) {
  return new URL(relativePath, importMeta.url);
}

export function clearDir(relativePath, importMeta) {
  const absPath = getAbsPath(relativePath, importMeta.url);
  if (fs.existsSync(absPath)) fs.rmSync(absPath, { recursive: true });
}

export function expectFileExists(importMeta, relPath) {
  const absPath = new URL(relPath, importMeta.url);
  assert(fs.existsSync(absPath), `Expected file to exist: ${relPath}`);
}

export function expectFileNotExists(importMeta, relPath) {
  const absPath = new URL(relPath, importMeta.url);
  assert(!fs.existsSync(absPath), `Expect file to not exist: ${relPath}`);
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
