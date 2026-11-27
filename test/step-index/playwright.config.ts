import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: process.env.FEATURES,
  steps: process.env.STEPS || 'features/steps.ts',
  useStepIndex: true,
});

export default defineConfig({ testDir });
