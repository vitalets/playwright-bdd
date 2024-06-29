/**
 * Load steps using Playwright's importOrRequire.
 */
import { resolveFiles } from '../utils/paths';
import { toArray } from '../utils';
import { requireOrImport } from '../playwright/requireOrImport';

const DEFAULT_STEP_EXTENSIONS = '{js,mjs,cjs,ts,mts,cts}';

export async function loadSteps(stepFiles: string[]) {
  for (const file of stepFiles) {
    await requireOrImport(file);
  }
}

export async function resolveStepFiles(cwd: string, patterns: string | string[]) {
  return resolveFiles(cwd, toArray(patterns), DEFAULT_STEP_EXTENSIONS);
}
