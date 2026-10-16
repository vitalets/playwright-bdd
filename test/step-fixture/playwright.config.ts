import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  testDir: defineBddConfig({
    features: 'features/*.feature',
    steps: 'features/steps/*.ts',
  }),
  reporter: 'line',
});
