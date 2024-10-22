/**
 * BDD Config.
 */
import path from 'node:path';
import { ImportTestFrom } from '../gen/formatter';
import { saveConfigToEnv } from './env';
import { getPlaywrightConfigDir } from './configDir';
import { BDDConfig, BDDInputConfig } from './types';
import { defaults } from './defaults';
import { removeUndefined } from '../utils';

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
  const configDir = getPlaywrightConfigDir({ resolveAndSave: isMainProcess });
  const config = getConfig(configDir, inputConfig);

  // In main process store config in env to be accessible by workers
  if (isMainProcess) {
    saveConfigToEnv(config);
  }

  return config.outputDir;
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
    features,
    steps,
    // important to resolve outputDir as it is used as unique key for input configs
    outputDir: path.resolve(configDir, config.outputDir),
    importTestFrom: resolveImportTestFrom(configDir, config.importTestFrom),
    featuresRoot,
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
