/**
 * BDD Config.
 */
import path from 'node:path';
import { ImportTestFrom } from '../gen/formatter';
import { getConfigDirFromEnv, saveConfigToEnv } from './env';
import { BDDConfig, BDDInputConfig } from './types';
import { defaults } from './defaults';
import { removeUndefined } from '../utils';
import { getCliConfigPath } from '../cli/options';
import { resolveConfigFile } from '../playwright/loadConfig';

export function defineBddProject(config: BDDInputConfig & { name: string }) {
  const { name, ...bddConfig } = config;
  if (name && !bddConfig.outputDir) {
    bddConfig.outputDir = path.join(defaults.outputDir, name);
  }
  const testDir = defineBddConfig(bddConfig);
  return { name, testDir };
}

export function defineBddConfig(inputConfig: BDDInputConfig) {
  const isMainProcess = !process.env.TEST_WORKER_INDEX;

  // In main process store config in env to be accessible by workers
  if (isMainProcess) {
    const configDir = resolveConfigDirInMainProcess();
    const config = getConfig(configDir, inputConfig);
    saveConfigToEnv(config);
    return config.outputDir;
  } else {
    const configDir = getConfigDirFromEnv();
    // resolve full config, although here we need only outputDir
    const config = getConfig(configDir, inputConfig);
    return config.outputDir;
  }
}

/**
 * Note: in workers process.argv is different,
 * that's why we use this fn only in main process.
 */
function resolveConfigDirInMainProcess() {
  const cliConfigPath = getCliConfigPath();
  const playwrightConfigFileFromCli = resolveConfigFile(cliConfigPath);
  return playwrightConfigFileFromCli ? path.dirname(playwrightConfigFileFromCli) : process.cwd();
}

// eslint-disable-next-line visual/complexity
function getConfig(configDir: string, inputConfig: BDDInputConfig): BDDConfig {
  const config = Object.assign({}, defaults, removeUndefined(inputConfig));

  const features = config.features || config.paths || config.featuresRoot;
  if (!features) throw new Error(`Please provide 'features' option in defineBddConfig()`);

  // Currently steps can be empty: e.g. when decorator steps loaded via importTestFrom
  // After removing importTestFrom we should throw error for missing steps as well.
  const steps = config.steps || config.require || config.import || config.featuresRoot || [];

  const featuresRoot = config.featuresRoot
    ? path.resolve(configDir, config.featuresRoot)
    : configDir;

  return {
    ...config,
    configDir,
    features,
    steps,
    featuresRoot,
    // important to resolve outputDir as it is used as unique key for input configs
    outputDir: path.resolve(configDir, config.outputDir),
    importTestFrom: resolveImportTestFrom(configDir, config.importTestFrom),
  };
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
