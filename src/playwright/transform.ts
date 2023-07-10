import path from 'path';
import Module from 'module';
import { addHook } from 'pirates';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
/* eslint-disable max-params */

/**
 * Installs require hook to transform ts.
 * Extracted from playwright.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/transform/transform.ts
 */
export function installTransform(): () => void {
  const { resolveHook, shouldTransform, transformHook } = requireTransform();

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

  const revertPirates = addHook(
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

export function requireTransform() {
  const playwrightRoot = path.dirname(require.resolve('@playwright/test'));
  const filePath = path.join(playwrightRoot, 'lib', 'transform', 'transform.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(filePath);
}
