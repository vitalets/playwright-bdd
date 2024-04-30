/**
 * Load steps using Playwright's import instead of Cucumber's tryRequire.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/api/support.ts
 */
import { IdGenerator } from '@cucumber/messages';
import { supportCodeLibraryBuilder } from '@cucumber/cucumber';
import { ISupportCodeLibrary } from './types';
import { resolveFiles } from '../utils/paths';
import { requireTransform } from '../playwright/transform';
import { toArray } from '../utils';

const newId = IdGenerator.uuid();

export async function loadStepsOwn(
  cwd: string,
  stepPaths: string | string[],
): Promise<ISupportCodeLibrary> {
  supportCodeLibraryBuilder.reset(cwd, newId, {
    requireModules: [],
    requirePaths: [],
    importPaths: [],
    loaders: [], // for cucumber 10.6
  } as Parameters<typeof supportCodeLibraryBuilder.reset>[2]);

  const stepFiles = await resolveFiles(cwd, toArray(stepPaths), '{js,mjs,cjs,ts,mts,cts}');
  const { requireOrImport } = requireTransform();

  for (const file of stepFiles) {
    await requireOrImport(file);
  }

  return supportCodeLibraryBuilder.finalize();
}
