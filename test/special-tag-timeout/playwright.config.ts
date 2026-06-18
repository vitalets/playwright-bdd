import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features'],
  steps: ['steps/*.ts'],
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  // don't make this timeout to small, b/c cucumber fixtures can't init
  timeout: 1000,
});
