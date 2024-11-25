import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  outputDir: `.features-gen/${process.env.FEATURES_ROOT}`,
  featuresRoot: process.env.FEATURES_ROOT!,
});

export default defineConfig({
  testDir,
});
