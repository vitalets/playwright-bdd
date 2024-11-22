/**
 * Mapping: feature uri <-> spec file.
 */
import path from 'node:path';
import { BDDConfig } from '../config/types';
import { exit } from '../utils/exit';

/**
 * Returns path to spec file by feature file.
 */
export function getSpecFileByFeatureFile(config: BDDConfig, relFeatureFile: string) {
  const absFeatureFile = path.resolve(config.configDir, relFeatureFile);
  const relSpecFile = path.relative(config.featuresRoot, absFeatureFile) + '.spec.js';
  if (relSpecFile.startsWith('..')) {
    exit(
      `All feature files should be located underneath featuresRoot.`,
      `Please change featuresRoot or paths in configuration.\n`,
      `featureFile: ${absFeatureFile}\n`,
      `featuresRoot: ${config.featuresRoot}\n`,
    );
  }
  const absSpecFile = path.resolve(config.outputDir, relSpecFile);
  return absSpecFile;
}

/**
 * Returns relative path to feature file by spec file.
 */
// commented, possibly we don't need this fn as we get feature uri from spec file itself
// export function getFeatureFileBySpecFile(config: BDDConfig, absSpecFile: string) {
//   const relSpecFile = path.relative(config.outputDir, absSpecFile);
//   const absFeatureFile = path.join(config.featuresRoot, relSpecFile).replace(/\.spec\.js$/, '');
//   const relFeatureFile = path.relative(config.configDir, absFeatureFile);
//   return relFeatureFile;
// }
