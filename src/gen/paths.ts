import path from 'node:path';
import { BDDConfig } from '../config/types';
import { exit } from '../utils/exit';

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
  return path.resolve(config.outputDir, relSpecFile);
}

// export function getFeatureFileBySpecFile(config: BDDConfig, relFeatureFile: string) {
//   const absFeatureFile = path.resolve(config.configDir, relFeatureFile);
//   const relSpecFile = path.relative(config.featuresRoot, absFeatureFile) + '.spec.js';
//   if (relSpecFile.startsWith('..')) {
//     exit(
//       `All feature files should be located underneath featuresRoot.`,
//       `Please change featuresRoot or paths in configuration.\n`,
//       `featureFile: ${absFeatureFile}\n`,
//       `featuresRoot: ${config.featuresRoot}\n`,
//     );
//   }
//   return path.resolve(config.outputDir, relSpecFile);
// }
