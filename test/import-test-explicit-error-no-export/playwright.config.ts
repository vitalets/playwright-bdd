import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features',
  steps: 'steps/steps.ts',
  importTestFrom: 'steps/fixtures.ts',
  disableWarnings: { importTestFrom: true },
});

export default defineConfig({
  testDir,
});
