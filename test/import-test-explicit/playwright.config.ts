import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features',
  steps: 'steps/*.ts',
  importTestFrom: 'steps/fixtures2',
  disableWarnings: process.env.DISABLE_WARNING
    ? {
        importTestFrom: true,
      }
    : undefined,
});

export default defineConfig({
  testDir,
});
