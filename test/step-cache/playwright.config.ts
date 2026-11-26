import { defineConfig } from '@playwright/test';
import { defineBddConfig, type BDDInputConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: process.env.FEATURES,
  steps: 'features/*.ts',
  missingSteps: process.env.MISSING_STEPS as BDDInputConfig['missingSteps'],
});

export default defineConfig({ testDir });
