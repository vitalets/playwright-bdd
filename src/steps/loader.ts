/**
 * Load steps using Playwright's importOrRequire.
 */
import { resolveFiles } from '../utils/paths';
import { toArray } from '../utils';
import { requireOrImport } from '../playwright/requireOrImport';
import { registerExportedTests } from './exportedTest';
import { loadBddExpressions } from './bddExpression';
import { stepDefinitions } from './stepRegistry';

const DEFAULT_STEP_EXTENSIONS = '{js,mjs,cjs,ts,mts,cts}';

export async function loadSteps(stepFiles: string[]) {
  for (const filePath of stepFiles) {
    await loadStepsFromFile(filePath);
  }
  if (stepDefinitions.some((definition) => definition.usesBddExpression)) {
    await loadBddExpressions();
  }
}

export async function loadStepsFromFile(filePath: string) {
  const obj = await requireOrImport(filePath);
  return registerExportedTests(filePath, obj);
}

export async function resolveStepFiles(cwd: string, patterns: string | string[]) {
  return resolveFiles(cwd, toArray(patterns), DEFAULT_STEP_EXTENSIONS);
}
