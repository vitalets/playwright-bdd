import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  testDir: defineBddConfig({ featuresRoot: 'features' }),
  // Avoid waiting the default 30 seconds if a step timeout fails to trigger.
  timeout: 5_000,
  workers: 1,
});
