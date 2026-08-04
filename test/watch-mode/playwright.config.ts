import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const extraWatchPath = process.env.BDDGEN_TEST_EXTRA_WATCH_PATH;
const ignoreWatchPath = process.env.BDDGEN_TEST_IGNORE_WATCH_PATH;
const watch =
  extraWatchPath || ignoreWatchPath
    ? {
        ...(extraWatchPath ? { extraPaths: [extraWatchPath] } : {}),
        ...(ignoreWatchPath ? { ignorePaths: [ignoreWatchPath] } : {}),
      }
    : undefined;
const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
  ...(watch ? { watch } : {}),
});

export default defineConfig({ testDir });
