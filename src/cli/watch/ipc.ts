import { watchDefaults } from '../../config/defaults';
import { BDDConfig } from '../../config/types';
import { removeDuplicates } from '../../utils';
import { normalizeExtensions } from './fileFilter';
import { resolveWatchPatterns } from './paths';

export const WATCH_CHILD_ENV = 'PLAYWRIGHT_BDD_WATCH_CHILD';

export type WatchMetadata = {
  resolvedConfigFile: string;
  packageRoot: boolean;
  gitIgnore: (boolean | string)[];
  include: string[];
  exclude: string[];
  extensions: string[];
  featurePatterns: string[];
  stepPatterns: string[];
  importTestFromFiles: string[];
  outputDirs: string[];
};

type WatchMetadataMessage = {
  type: 'metadata';
  metadata: WatchMetadata;
};

type ReadyToGenerateMessage = {
  type: 'ready-to-generate';
};

export type WatchChildMessage = WatchMetadataMessage | ReadyToGenerateMessage;

export type StartGenerationMessage = {
  type: 'start-generation';
};

export function isWatchModeChild() {
  return Boolean(process.env[WATCH_CHILD_ENV]);
}

export function sendWatchMetadataToParent(configs: BDDConfig[], resolvedConfigFile: string) {
  const metadata: WatchMetadata = {
    resolvedConfigFile,
    packageRoot: configs.some((config) => config.watch?.packageRoot ?? watchDefaults.packageRoot),
    gitIgnore: removeDuplicates(
      configs.map((config) => config.watch?.gitIgnore ?? watchDefaults.gitIgnore),
    ),
    include: removeDuplicates(
      configs.flatMap((config) => config.watch?.include ?? watchDefaults.include),
    ),
    exclude: removeDuplicates(
      configs.flatMap((config) => config.watch?.exclude ?? watchDefaults.exclude),
    ),
    extensions: normalizeExtensions(
      configs.flatMap((config) => config.watch?.extensions ?? watchDefaults.extensions),
    ),
    featurePatterns: resolveWatchPatterns(configs, 'features'),
    stepPatterns: resolveWatchPatterns(configs, 'steps'),
    importTestFromFiles: removeDuplicates(
      configs.flatMap((config) => (config.importTestFrom ? [config.importTestFrom.file] : [])),
    ),
    outputDirs: removeDuplicates(configs.map((config) => config.outputDir)),
  };
  process.send?.({ type: 'metadata', metadata });
}

export async function waitForStartGenerationMessage() {
  if (!process.send) return;
  await new Promise<void>((resolve) => {
    const handleMessage = (message: StartGenerationMessage) => {
      if (message?.type !== 'start-generation') return;
      process.removeListener('message', handleMessage);
      resolve();
    };
    process.on('message', handleMessage);
    process.send?.({ type: 'ready-to-generate' } satisfies ReadyToGenerateMessage);
  });
}
