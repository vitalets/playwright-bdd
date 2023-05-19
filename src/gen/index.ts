/**
 * Generate playwright tests from Gherkin documents.
 */
import path from 'node:path';
import { GherkinDocument, Pickle } from '@cucumber/messages';
import { PWFile } from './generate';
import { saveFiles } from './save';
import { loadConfig } from '../cucumber/config';
import { loadFeatures } from '../cucumber/features';
import { loadSteps } from '../cucumber/steps';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';

export type GenOptions = {
  /** Dir to save generated files */
  outputDir?: string;
  /** Path to cucumber config file */
  cucumberConfig?: string;
  /** Working dir */
  cwd?: string;
};

const defaults: Required<Pick<GenOptions, 'outputDir' | 'cwd'>> = {
  outputDir: '.features-gen',
  cwd: process.cwd(),
};

export async function generateTestFiles(inputOptions?: GenOptions) {
  const { outputDir, cwd, cucumberConfig } = Object.assign({}, defaults, inputOptions);
  const environment = { cwd };
  const { runConfiguration } = await loadConfig({ file: cucumberConfig }, environment);
  const [features, supportCodeLibrary] = await Promise.all([
    loadFeatures(runConfiguration, environment),
    loadSteps(runConfiguration, environment),
  ]);
  const files = buildFiles(features, supportCodeLibrary);
  const paths = saveFiles(files, path.join(cwd, outputDir));
  return paths;
}

function buildFiles(features: Map<GherkinDocument, Pickle[]>, supportCodeLibrary: ISupportCodeLibrary) {
  const files: PWFile[] = [];
  features.forEach((pickles, doc) => {
    const file = new PWFile(doc, pickles, supportCodeLibrary).build();
    files.push(file);
  });
  return files;
}
