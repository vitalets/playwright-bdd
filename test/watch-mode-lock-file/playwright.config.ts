import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
  lockFile: true,
  watch: { gitIgnore: false },
});

export default defineConfig({ testDir });
