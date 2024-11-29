import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: process.env.FEATURES_ROOT!,
});

export default defineConfig({
  testDir,
});
