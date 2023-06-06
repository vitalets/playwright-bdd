import path from 'node:path';
import { ImportTestFrom } from '../gen/formatter';
import { IConfiguration } from '@cucumber/cucumber/api';
import { getInputConfig } from './input';

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
};

export const defaults = {
  outputDir: '.features-gen',
  publishQuiet: true,
} satisfies Required<Pick<BDDInputConfig, 'outputDir' | 'publishQuiet'>>;

export type BDDInputConfig = OwnConfig & CucumberConfig;
export type BDDConfig = ReturnType<typeof getConfig>;

export function getConfig(inputConfig?: BDDInputConfig) {
  // try to pull input config from env var
  const inputConfigFromEnv = getInputConfig(inputConfig?.outputDir);
  const config = Object.assign({}, defaults, inputConfigFromEnv, inputConfig);
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
