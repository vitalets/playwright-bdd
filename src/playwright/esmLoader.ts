/**
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/esmLoaderHost.ts
 */
import { requirePlaywrightModule } from './utils';

// registerESMLoader was added in PW 1.41 and allows to setup esm loader hook without process restart.
// In pw-bdd we keep only this way for esm support.
// PW has older way with process restart that is complicated.
// see: https://github.com/microsoft/playwright/pull/28526/files#diff-490565cd49c7e9417108773db457433c2af9a123443be8b5dae11be091107d65
export function registerESMLoader() {
  const { registerESMLoader } = requirePlaywrightModule('lib/common/esmLoaderHost.js');
  registerESMLoader();
}
