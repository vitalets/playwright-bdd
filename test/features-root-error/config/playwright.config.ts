import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['../root.feature'],
  require: ['../steps.ts'],
  outputDir: '../.features-gen',
});

export default defineConfig({
  testDir,
});
