import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const includeWatchPath = process.env.BDDGEN_TEST_INCLUDE_WATCH_PATH;
const excludeWatchPath = process.env.BDDGEN_TEST_EXCLUDE_WATCH_PATH;
const watch =
  includeWatchPath || excludeWatchPath
    ? {
        ...(includeWatchPath ? { include: [includeWatchPath] } : {}),
        ...(excludeWatchPath ? { exclude: [excludeWatchPath] } : {}),
      }
    : undefined;
const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
  ...(watch ? { watch } : {}),
});

export default defineConfig({ testDir });
