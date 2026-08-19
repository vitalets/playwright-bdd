import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const includeWatchPath = process.env.WATCH_INCLUDE;
const excludeWatchPath = process.env.WATCH_EXCLUDE;
const lockFile = process.env.LOCK_FILE === 'true';
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
  ...(lockFile ? { lockFile: true } : {}),
  ...(watch ? { watch } : {}),
});

export default defineConfig({ testDir });
