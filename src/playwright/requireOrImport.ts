/**
 * Universal requireOrImport function that can import any file (js/ts, cjs/esm)
 */
import { requirePlaywrightModule, playwrightVersion } from './utils';
import { registerESMLoader } from './esmLoader';
import { relativeToCwd } from '../utils/paths';

export async function requireOrImport(file: string) {
  registerESMLoader();
  const { requireOrImport: pwRequireOrImport } = getTransformMethods();
  return pwRequireOrImport(file);
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

function getTransformMethods() {
  // Since PW 1.60 there is an index.js file with all exports.
  const { requireOrImport } =
    playwrightVersion >= '1.60.0'
      ? requirePlaywrightModule('lib/common/index.js').transform
      : requirePlaywrightModule('lib/transform/transform.js');

  return { requireOrImport };
}
