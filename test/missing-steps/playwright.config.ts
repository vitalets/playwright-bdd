import { defineConfig } from '@playwright/test';
import { defineBddConfig, BDDInputConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
  missingSteps: process.env.MISSING_STEPS as BDDInputConfig['missingSteps'],
});

export default defineConfig({
  testDir,
});
