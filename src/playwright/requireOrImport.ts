/**
 * Universal requireOrImport function that can import any file (js/ts, cjs/esm)
 */

import { installEsmLoaderIfNeeded } from './esmLoader';
import { requireTransform } from './transform';

export async function requireOrImport(file: string) {
  await installEsmLoaderIfNeeded();
  return requireTransform().requireOrImport(file);
}
