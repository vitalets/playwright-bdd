import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { resolveEnvBoolean } from '../_helpers/env';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
  watch: {
    gitIgnore: resolveEnvBoolean(process.env.WATCH_GIT_IGNORE),
  },
});

export default defineConfig({ testDir });
