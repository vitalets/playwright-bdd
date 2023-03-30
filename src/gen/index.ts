/**
 * Generate playwright tests from Gherkin documents.
 */

import { loadConfiguration } from '@cucumber/cucumber/api';
import { loadSources } from './load_sources';
import { PWFile } from './generate';
import { saveFiles } from './save';
import { Transformer } from './transform';

export type GenOptions = {
  outputDir?: string;
};

const defaults: Required<Pick<GenOptions, 'outputDir'>> = {
  outputDir: '.features-gen',
};

export async function generateTestFiles(inputOptions?: GenOptions) {
  const { outputDir } = Object.assign({}, defaults, inputOptions);
  const pickles = await loadPickles();
  const suites = new Transformer(pickles).run();
  const files = suites.map((suite) => new PWFile(suite).run());
  saveFiles(files, outputDir);
}

async function loadPickles() {
  const { runConfiguration } = await loadConfiguration();
  const { filteredPickles } = await loadSources(runConfiguration.sources);
  return filteredPickles;
}
