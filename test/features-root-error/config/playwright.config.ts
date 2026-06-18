import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['../root.feature'],
  steps: ['../steps.ts'],
  outputDir: '../.features-gen',
});

export default defineConfig({
  testDir,
});
