/**
 * Load steps using Playwright's import instead of Cucumber's tryRequire.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/api/support.ts
 */
import { ISupportCodeLibrary } from './types';
import { resolveFiles } from '../utils/paths';
import { requireTransform } from '../playwright/transform';
import { toArray } from '../utils';
import { stepDefinitions } from '../steps/registry';

const DEFAULT_STEP_EXTENSIONS = '{js,mjs,cjs,ts,mts,cts}';

export async function loadStepsOwn(cwd: string, stepPaths: string | string[]) {
  const stepFiles = await resolveFiles(cwd, toArray(stepPaths), DEFAULT_STEP_EXTENSIONS);
  const { requireOrImport } = requireTransform();

  for (const file of stepFiles) {
    await requireOrImport(file);
  }

  return { stepDefinitions } as ISupportCodeLibrary;
}
