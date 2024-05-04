import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features'],
  require: ['steps/*.ts'],
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  // don't make this timeout to small, b/c cucumber fixtures can't init
  timeout: 1000,
});
