import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['./features', '../root.feature', '../subdir'],
  require: ['steps.ts', '../steps.ts', '../subdir/*.ts'],
  outputDir: '../.features-gen',
  featuresRoot: '..',
});

export default defineConfig({
  testDir,
});
