/**
 * BDD Config.
 */
import path from 'node:path';
import { ImportTestFrom } from '../gen/formatter';
import { saveConfigToEnv } from './env';
import { getPlaywrightConfigDir } from './configDir';
import { getPackageVersion } from '../utils';
import { BDDConfig, BDDInputConfig, CucumberConfig, OwnConfig } from './types';
import { defaults } from './defaults';

export function defineBddConfig(inputConfig?: BDDInputConfig) {
  const isMainProcess = !process.env.TEST_WORKER_INDEX;
  const configDir = getPlaywrightConfigDir({ resolveAndSave: isMainProcess });
  const config = getConfig(configDir, inputConfig);

  // In main process store config in env to be accessible by workers
  if (isMainProcess) {
    saveConfigToEnv(config);
  }

  return config.outputDir;
}

function getConfig(configDir: string, inputConfig?: BDDInputConfig): BDDConfig {
  const config = Object.assign({}, defaults, inputConfig);
  const featuresRoot = config.featuresRoot
    ? path.resolve(configDir, config.featuresRoot)
    : configDir;

  if (config.steps && (config.require || config.import)) {
    throw new Error(`Config option 'steps' can't be used together with 'require' or 'import'`);
  }

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
  const omitProps: Record<keyof OwnConfig, true> = {
    outputDir: true,
    importTestFrom: true,
    verbose: true,
    skip: true,
    examplesTitleFormat: true,
    quotes: true,
    tags: true,
    featuresRoot: true,
    enrichReporterData: true,
    steps: true,
    statefulPoms: true,
  };
  const keys = Object.keys(omitProps) as (keyof OwnConfig)[];
  const cucumberConfig = { ...config };
  keys.forEach((key) => delete cucumberConfig[key]);

  stripPublishQuiet(cucumberConfig);

  return cucumberConfig;
}

function resolveImportTestFrom(
  configDir: string,
  importTestFrom?: string | ImportTestFrom,
): ImportTestFrom | undefined {
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

function stripPublishQuiet(cucumberConfig: CucumberConfig) {
  const cucumberVersion = getPackageVersion('@cucumber/cucumber');
  // Playwright-bdd supports Cucumber from v9+
  // publishQuiet was deprecated in Cucumber 9.4.0.
  // See: https://github.com/cucumber/cucumber-js/pull/2311
  // Remove publishQuite from Cucumber config to hide deprecation warning.
  // See: https://github.com/vitalets/playwright-bdd/pull/47
  if (!/^9\.[0123]\./.test(cucumberVersion)) {
    delete cucumberConfig.publishQuiet;
  }
}
