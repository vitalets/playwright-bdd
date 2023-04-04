/**
 * Generate playwright tests from Gherkin documents.
 */
import path from 'node:path';
import {
  ILoadConfigurationOptions,
  IRunEnvironment,
  loadConfiguration,
} from '@cucumber/cucumber/api';
import { loadSources } from './load_sources';
import { PWFile } from './generate';
import { saveFiles } from './save';
import { Transformer } from './transform';

export type GenOptions = {
  outputDir?: string;
  cucumberConfig?: string;
  cwd?: string;
};

const defaults: Required<Pick<GenOptions, 'outputDir' | 'cwd'>> = {
  outputDir: '.features-gen',
  cwd: process.cwd(),
};

export async function generateTestFiles(inputOptions?: GenOptions) {
  const { outputDir, cwd, cucumberConfig } = Object.assign(
    {},
    defaults,
    inputOptions
  );
  const pickles = await loadPickles({ file: cucumberConfig }, { cwd });
  const suites = new Transformer(pickles).run();
  const files = suites.map((suite) => new PWFile(suite).run());
  const paths = saveFiles(files, path.join(cwd, outputDir));
  return paths;
}

async function loadPickles(
  options?: ILoadConfigurationOptions,
  environment?: IRunEnvironment
) {
  const { runConfiguration } = await loadConfiguration(options, environment);
  const { filteredPickles, parseErrors } = await loadSources(
    runConfiguration.sources,
    environment
  );
  if (parseErrors.length) {
    parseErrors.forEach((parseError) => {
      // eslint-disable-next-line no-console
      console.error(
        `Parse error in "${parseError.source.uri}" ${parseError.message}`
      );
    });
    process.exit(1);
  }
  return filteredPickles;
}
