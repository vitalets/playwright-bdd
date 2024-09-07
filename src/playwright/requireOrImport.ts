/**
 * Universal requireOrImport function that can import any file (js/ts, cjs/esm)
 */
import { requirePlaywrightModule } from './utils';
import { installEsmLoaderIfNeeded } from './esmLoader';
import { relativeToCwd } from '../utils/paths';

export async function requireOrImport(file: string) {
  await installEsmLoaderIfNeeded();
  const transform = requirePlaywrightModule('lib/transform/transform.js');
  return transform.requireOrImport(file);
}

// eslint-disable-next-line visual/complexity
export async function requireOrImportDefaultFunction(file: string, expectConstructor: boolean) {
  let func = await requireOrImport(file);
  if (func && typeof func === 'object' && 'default' in func) func = func['default'];
  if (typeof func !== 'function') {
    throw new Error(
      `${relativeToCwd(file)}: file must export a single ${expectConstructor ? 'class' : 'function'}.`,
    );
  }
  return func;
}
