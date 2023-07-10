import Module from 'module';
import { requirePlaywrightModule } from './utils';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
/* eslint-disable max-params */

/**
 * Installs require hook to transform ts.
 * Extracted from playwright.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/transform/transform.ts
 */
export function installTransform(): () => void {
  const { pirates } = requirePlaywrightModule('lib/utilsBundle.js');
  const { resolveHook, shouldTransform, transformHook } = requirePlaywrightModule(
    'lib/transform/transform.js',
  );

  let reverted = false;

  const originalResolveFilename = (Module as any)._resolveFilename;
  function resolveFilename(this: any, specifier: string, parent: Module, ...rest: any[]) {
    if (!reverted && parent) {
      const resolved = resolveHook(parent.filename, specifier);
      if (resolved !== undefined) specifier = resolved;
    }
    return originalResolveFilename.call(this, specifier, parent, ...rest);
  }
  (Module as any)._resolveFilename = resolveFilename;

  const revertPirates = pirates.addHook(
    (code: string, filename: string) => {
      if (!shouldTransform(filename)) return code;
      return transformHook(code, filename);
    },
    { exts: ['.ts', '.tsx', '.js', '.jsx', '.mjs'] },
  );

  return () => {
    reverted = true;
    (Module as any)._resolveFilename = originalResolveFilename;
    revertPirates();
  };
}
