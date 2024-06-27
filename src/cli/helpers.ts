import { esmLoaderInstalled } from '../playwright/esmLoader';
import { playwrightVersion } from '../playwright/utils';

// In PW <= 1.43 esm loader keep messaging port open -> we need to close process manually
// Fixed in PW 1.44: https://github.com/microsoft/playwright/pull/30271
export function forceExitIfNeeded() {
  if (esmLoaderInstalled && playwrightVersion < '1.44.0') {
    setTimeout(() => process.exit(process.exitCode || 0), 0).unref();
  }
}
