import path from 'node:path';
import { BDDConfig } from '../../config/types';
import { removeDuplicates, toArray } from '../../utils';

// The child loads config fresh and sends the resolved watch metadata over IPC.
// This lets the parent refresh its watcher without loading user config in the long-lived process.
export function sendWatchMetadata(configs: BDDConfig[], resolvedConfigFile: string) {
  if (process.env[WATCH_CHILD_ENV]) {
    const metadata: WatchMetadata = {
      resolvedConfigFile,
      packageRoot: configs.some((config) => config.watch?.packageRoot !== false),
      include: removeDuplicates(configs.flatMap((config) => config.watch?.include ?? [])),
      exclude: removeDuplicates(configs.flatMap((config) => config.watch?.exclude ?? [])),
      featurePatterns: getPatterns(configs, 'features'),
      stepPatterns: getPatterns(configs, 'steps'),
      importTestFromFiles: removeDuplicates(
        configs.flatMap((config) => (config.importTestFrom ? [config.importTestFrom.file] : [])),
      ),
      outputDirs: removeDuplicates(configs.map((config) => config.outputDir)),
    };
    process.send?.({ type: 'metadata', metadata });
  }
}

export const WATCH_CHILD_ENV = 'PLAYWRIGHT_BDD_WATCH_CHILD';

export type WatchMetadata = {
  resolvedConfigFile: string;
  packageRoot: boolean;
  include: string[];
  exclude: string[];
  featurePatterns: string[];
  stepPatterns: string[];
  importTestFromFiles: string[];
  outputDirs: string[];
};

export type WatchMetadataMessage = {
  type: 'metadata';
  metadata: WatchMetadata;
};

function getPatterns(configs: BDDConfig[], key: 'features' | 'steps') {
  return removeDuplicates(
    configs.flatMap((config) =>
      toArray(config[key]).map((pattern) => path.resolve(config.configDir, pattern)),
    ),
  );
}
