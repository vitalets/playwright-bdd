import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['./features', '../root.feature', '../subdir'],
  steps: ['steps.ts', '../steps.ts', '../subdir/*.ts'],
  outputDir: '../.features-gen',
  featuresRoot: '..',
});

export default defineConfig({
  testDir,
});
