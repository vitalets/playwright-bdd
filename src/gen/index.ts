/**
 * Generate playwright test files from Gherkin documents.
 */
import fs from 'node:fs';
import { GherkinDocument, Pickle } from '@cucumber/messages';
import { TestFile } from './testFile';
import { loadConfig } from '../cucumber/loadConfig';
import { loadFeatures } from '../cucumber/loadFeatures';
import { loadSteps } from '../cucumber/loadSteps';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { GenOptions, ResolvedOptions, getOptions } from './options';

export async function generateTestFiles(inputOptions?: GenOptions) {
  const options = getOptions(inputOptions);
  const { runConfiguration } = await loadConfig();
  const [features, supportCodeLibrary] = await Promise.all([
    loadFeatures(runConfiguration),
    loadSteps(runConfiguration),
  ]);
  const files = buildFiles(features, supportCodeLibrary, options);
  const paths = saveFiles(files, options);
  return paths;
}

function buildFiles(
  features: Map<GherkinDocument, Pickle[]>,
  supportCodeLibrary: ISupportCodeLibrary,
  { outputDir, importTestFrom }: ResolvedOptions,
) {
  const files: TestFile[] = [];
  features.forEach((pickles, doc) => {
    const file = new TestFile({ doc, pickles, supportCodeLibrary, outputDir, importTestFrom }).build();
    files.push(file);
  });
  return files;
}

function saveFiles(files: TestFile[], { outputDir }: ResolvedOptions) {
  clearDir(outputDir);
  return files.map((file) => {
    file.save();
    return file.outputPath;
  });
}

function clearDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
}
