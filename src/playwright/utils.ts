import path from 'node:path';
import { getPackageVersion, resolvePackageRoot } from '../utils';
import { TestInfo } from '@playwright/test';
import { PwAnnotation } from './types';

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

export function getPlaywrightModulePath(relativePath: string) {
  return path.join(getPlaywrightRoot(), relativePath);
}

function getPlaywrightRoot() {
  if (!playwrightRoot) {
    playwrightRoot = resolvePackageRoot('playwright');
  }

  return playwrightRoot;
}

/**
 * Create or update annotation with provided type.
 */
export function updateAnnotation(
  testInfo: TestInfo,
  annotation: PwAnnotation,
  { create = false } = {},
) {
  const { annotations } = testInfo;
  const index = annotations.findIndex((a) => a.type === annotation.type);
  if (index === -1 && !create) throw new Error(`Annotation "${annotation.type}" is not found.`);
  if (index === -1) {
    annotations.push(annotation);
  } else {
    annotations[index] = annotation;
  }
}
