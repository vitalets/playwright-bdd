/**
 * Load steps using Playwright's import instead of Cucumber's tryRequire.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/api/support.ts
 */
import { resolveFiles } from '../utils/paths';
import { requireTransform } from '../playwright/transform';
import { toArray } from '../utils';

const DEFAULT_STEP_EXTENSIONS = '{js,mjs,cjs,ts,mts,cts}';

export async function resolveAndLoadSteps(cwd: string, patterns: string | string[]) {
  const stepFiles = await resolveStepFiles(cwd, patterns);
  await loadSteps(stepFiles);
}

async function loadSteps(stepFiles: string[]) {
  const { requireOrImport } = requireTransform();

  for (const file of stepFiles) {
    await requireOrImport(file);
  }
}

async function resolveStepFiles(cwd: string, patterns: string | string[]) {
  return resolveFiles(cwd, toArray(patterns), DEFAULT_STEP_EXTENSIONS);
}
