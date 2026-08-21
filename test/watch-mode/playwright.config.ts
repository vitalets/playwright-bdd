import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { resolveEnvBoolean } from '../_helpers/env';

const includeWatchPath = process.env.WATCH_INCLUDE;
const excludeWatchPath = process.env.WATCH_EXCLUDE;
const lockFile = process.env.LOCK_FILE === 'true';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
  ...(lockFile ? { lockFile: true } : {}),
  watch: {
    gitIgnore: resolveEnvBoolean(process.env.WATCH_GIT_IGNORE) ?? false,
    ...(includeWatchPath ? { include: [includeWatchPath] } : {}),
    ...(excludeWatchPath ? { exclude: [excludeWatchPath] } : {}),
  },
});

export default defineConfig({ testDir });
