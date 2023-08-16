/**
 * BDD Config.
 */
import path from 'node:path';
import { ImportTestFrom } from '../gen/formatter';
import { IConfiguration } from '@cucumber/cucumber/api';
import { saveConfigToEnv } from './env';
import { getPlaywrightConfigDir } from './dir';

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
  /** Quotes style in generated tests */
  quotes?: 'single' | 'double' | 'backtick';
  /** Tags expression to filter scenarios for generation */
  tags?: string;
  /** Parent directory for all feature files used to construct output paths */
  featuresRoot?: string;
};

export const defaults: Required<
  Pick<BDDInputConfig, 'outputDir' | 'publishQuiet' | 'verbose' | 'examplesTitleFormat' | 'quotes'>
> = {
  outputDir: '.features-gen',
  verbose: false,
  examplesTitleFormat: 'Example #<_index_>',
  publishQuiet: true,
  quotes: 'double',
};

export type BDDInputConfig = OwnConfig & CucumberConfig;
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
  const configDir = getPlaywrightConfigDir();
  const featuresRoot = config.featuresRoot
    ? path.resolve(configDir, config.featuresRoot)
    : configDir;

  return {
    ...config,
    // important to resolve outputDir as it is used as unique key for input configs
    outputDir: path.resolve(configDir, config.outputDir),
    importTestFrom: resolveImportTestFrom(configDir, config.importTestFrom),
    featuresRoot,
  };
}

export function extractCucumberConfig(config: BDDConfig): CucumberConfig {
  // todo: find more strict way to omit own config fields
  // see: https://bobbyhadz.com/blog/typescript-object-remove-property
  const ownProps: Record<keyof OwnConfig, true> = {
    outputDir: true,
    importTestFrom: true,
    verbose: true,
    skip: true,
    examplesTitleFormat: true,
    quotes: true,
    tags: true,
    featuresRoot: true,
  };
  const ownKeys = Object.keys(ownProps) as (keyof OwnConfig)[];
  const cucumberConfig = { ...config };
  ownKeys.forEach((key) => delete cucumberConfig[key]);

  return cucumberConfig;
}

function resolveImportTestFrom(configDir: string, importTestFrom?: string | ImportTestFrom) {
  if (importTestFrom) {
    const { file, varName } =
      typeof importTestFrom === 'string'
        ? ({ file: importTestFrom } as ImportTestFrom)
        : importTestFrom;

    return {
      file: path.resolve(configDir, file),
      varName,
    };
  }
}
