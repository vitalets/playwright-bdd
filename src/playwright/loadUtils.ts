/**
 * Partial from: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/runner/loadUtils.ts
 */

/* eslint-disable complexity */
import path from 'node:path';
import { requireTransform } from './transform';

export async function requireOrImportDefaultFunction(file: string, expectConstructor: boolean) {
  let func = await requireTransform().requireOrImport(file);
  if (func && typeof func === 'object' && 'default' in func) func = func['default'];
  if (typeof func !== 'function') {
    throw errorWithFile(
      file,
      `file must export a single ${expectConstructor ? 'class' : 'function'}.`,
    );
  }
  return func;
}

function relativeFilePath(file: string): string {
  if (!path.isAbsolute(file)) return file;
  return path.relative(process.cwd(), file);
}

function errorWithFile(file: string, message: string) {
  return new Error(`${relativeFilePath(file)}: ${message}`);
}
