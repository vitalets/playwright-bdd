import path from 'node:path';
import { BDDConfig } from '../../config/types';
import { removeDuplicates, toArray } from '../../utils';
import { DEFAULT_WATCH_EXTENSIONS, normalizeExtensions } from './fileFilter';

// The child loads config fresh and sends the resolved watch metadata over IPC.
// This lets the parent refresh its watcher without loading user config in the long-lived process.
export function sendWatchMetadata(configs: BDDConfig[], resolvedConfigFile: string) {
  if (isWatchModeChild()) {
    const metadata: WatchMetadata = {
      resolvedConfigFile,
      packageRoot: configs.some((config) => config.watch?.packageRoot !== false),
      include: removeDuplicates(configs.flatMap((config) => config.watch?.include ?? [])),
      exclude: removeDuplicates(configs.flatMap((config) => config.watch?.exclude ?? [])),
      extensions: normalizeExtensions(
        configs.flatMap((config) => config.watch?.extensions ?? DEFAULT_WATCH_EXTENSIONS),
      ),
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

export function isWatchModeChild() {
  return Boolean(process.env[WATCH_CHILD_ENV]);
}

export async function waitForWatchParentReady() {
  if (!process.send) return;
  await new Promise<void>((resolve) => {
    const handleMessage = (message: WatchParentMessage) => {
      if (message?.type !== 'start-generation') return;
      process.removeListener('message', handleMessage);
      resolve();
    };
    process.on('message', handleMessage);
    process.send?.({ type: 'generation-ready' } satisfies WatchGenerationReadyMessage);
  });
}

export const WATCH_CHILD_ENV = 'PLAYWRIGHT_BDD_WATCH_CHILD';

export type WatchMetadata = {
  resolvedConfigFile: string;
  packageRoot: boolean;
  include: string[];
  exclude: string[];
  extensions: string[];
  featurePatterns: string[];
  stepPatterns: string[];
  importTestFromFiles: string[];
  outputDirs: string[];
};

export type WatchMetadataMessage = {
  type: 'metadata';
  metadata: WatchMetadata;
};

export type WatchGenerationReadyMessage = {
  type: 'generation-ready';
};

export type WatchChildMessage = WatchMetadataMessage | WatchGenerationReadyMessage;

export type WatchParentMessage = {
  type: 'start-generation';
};

function getPatterns(configs: BDDConfig[], key: 'features' | 'steps') {
  return removeDuplicates(
    configs.flatMap((config) =>
      toArray(config[key]).map((pattern) => path.resolve(config.configDir, pattern)),
    ),
  );
}
