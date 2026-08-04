import { BDDConfig } from '../../config/types';
import { removeDuplicates } from '../../utils';

// The child loads config fresh and sends the resolved watch metadata over IPC.
// This lets the parent refresh its watcher without loading user config in the long-lived process.
export function sendWatchMetadata(configs: BDDConfig[], resolvedConfigFile: string) {
  if (process.env[WATCH_CHILD_ENV]) {
    const metadata: WatchMetadata = {
      resolvedConfigFile,
      extraPaths: removeDuplicates(configs.flatMap((config) => config.watch?.extraPaths ?? [])),
      ignorePaths: removeDuplicates(configs.flatMap((config) => config.watch?.ignorePaths ?? [])),
      outputDirs: removeDuplicates(configs.map((config) => config.outputDir)),
    };
    process.send?.({ type: 'metadata', metadata });
  }
}

export const WATCH_CHILD_ENV = 'PLAYWRIGHT_BDD_WATCH_CHILD';

export type WatchMetadata = {
  resolvedConfigFile: string;
  extraPaths: string[];
  ignorePaths: string[];
  outputDirs: string[];
};

export type WatchMetadataMessage = {
  type: 'metadata';
  metadata: WatchMetadata;
};
