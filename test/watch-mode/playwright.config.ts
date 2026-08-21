import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const includeWatchPath = process.env.WATCH_INCLUDE;
const excludeWatchPath = process.env.WATCH_EXCLUDE;

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
  watch: {
    gitIgnore: false,
    ...(includeWatchPath ? { include: [includeWatchPath] } : {}),
    ...(excludeWatchPath ? { exclude: [excludeWatchPath] } : {}),
  },
});

export default defineConfig({ testDir });
