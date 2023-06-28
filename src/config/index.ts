/**
 * BDD Config.
 */
import path from 'node:path';
import { ImportTestFrom } from '../gen/formatter';
import { IConfiguration } from '@cucumber/cucumber/api';
import { saveConfigToEnv } from './env';

// todo: pick only relevant fields from cucumber config
type CucumberConfig = Partial<IConfiguration>;

type OwnConfig = {
  /** Dir to save generated files */
  outputDir?: string;
  /** Path to file for importing test instance */
  importTestFrom?: string | ImportTestFrom;
  /** Verbose mode */
  verbose?: boolean;
  /** Skip generation of test files */
  skip?: boolean;
  /** Test title format for scenario outline examples */
  examplesTitleFormat?: string;
};

export const defaults: Required<
  Pick<BDDInputConfig, 'outputDir' | 'publishQuiet' | 'verbose' | 'examplesTitleFormat'>
> = {
  outputDir: '.features-gen',
  verbose: false,
  examplesTitleFormat: 'Example #<_index_>',
  publishQuiet: true,
};

type BDDInputConfig = OwnConfig & CucumberConfig;
export type BDDConfig = ReturnType<typeof getConfig>;

export function defineBddConfig(inputConfig?: BDDInputConfig) {
  const config = getConfig(inputConfig);

  // In main process store config in env to be accessible by workers
  if (!process.env.TEST_WORKER_INDEX) {
    saveConfigToEnv(config);
  }

  return config.outputDir;
}

function getConfig(inputConfig?: BDDInputConfig) {
  const config = Object.assign({}, defaults, inputConfig);
  return {
    ...config,
    // important to resolve outputDir as it is used as unique key for input configs
    outputDir: path.resolve(config.outputDir),
    importTestFrom: resolveImportTestFrom(config.importTestFrom),
  };
}

export function extractCucumberConfig(config: BDDConfig): CucumberConfig {
  // todo: find more strict way to omit own config fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { outputDir, importTestFrom, ...cucumberConfig } = config;
  return cucumberConfig;
}

function resolveImportTestFrom(importTestFrom?: string | ImportTestFrom) {
  if (importTestFrom) {
    const { file, varName } =
      typeof importTestFrom === 'string'
        ? ({ file: importTestFrom } as ImportTestFrom)
        : importTestFrom;

    return {
      file: path.resolve(file),
      varName,
    };
  }
}
