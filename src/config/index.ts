/**
 * BDD Config.
 */
import path from 'node:path';
import { ImportTestFrom } from '../generate/formatter';
import { getConfigDirFromEnv, saveConfigToEnv } from './env';
import { BDDConfig, BDDInputConfig, BDDProjectConfig } from './types';
import { defaults } from './defaults';
import { removeUndefined } from '../utils';
import { resolveConfigLocation } from '../playwright/loadConfig';
import { isDirectory } from '../utils/paths';
import { exit } from '../utils/exit';
import { getCliConfigPath } from '../cli/options';

export function defineBddProject(config: BDDProjectConfig) {
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
    // it's important to try to get config dir from env first,
    // because Playwright can evaluate config in some other cases (vs code).
    const configDir = getConfigDirFromEnv({ throws: false }) || resolveConfigDir();
    const config = getConfig(configDir, inputConfig);
    saveConfigToEnv(config);
    return config.outputDir;
  } else {
    const configDir = getConfigDirFromEnv({ throws: true });
    return resolveOutputDir(configDir, inputConfig?.outputDir);
  }
}

// eslint-disable-next-line visual/complexity
function getConfig(configDir: string, inputConfig: BDDInputConfig): BDDConfig {
  const config = Object.assign({}, defaults, removeUndefined(inputConfig));

  validateFeaturesRoot(config.featuresRoot);

  const features = config.features || config.paths || config.featuresRoot;
  if (!features) {
    exit(`Please provide 'features' or 'featuresRoot' option in defineBddConfig()`);
  }

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
    outputDir: resolveOutputDir(configDir, config.outputDir),
    importTestFrom: resolveImportTestFrom(configDir, config.importTestFrom),
  };
}

/**
 * Returns Playwright config dir considering cli --config option.
 * Note: This fn must be called only in main process, because in workers
 * process.argv is different.
 */
function resolveConfigDir() {
  return resolveConfigLocation(getCliConfigPath()).configDir;
}

/**
 * Separate function to resolve only outputDir.
 * Used in workers, to not resolve the whole config again.
 */
function resolveOutputDir(configDir: string, providedOutputDir?: string) {
  return path.resolve(configDir, providedOutputDir || defaults.outputDir);
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

function validateFeaturesRoot(featuresRoot?: string) {
  if (featuresRoot && !isDirectory(featuresRoot)) {
    exit(
      `Config option 'featuresRoot' should be a directory.`,
      `You can provide 'features' option with glob pattern, e.g. ./features/*.feature.`,
    );
  }
}
