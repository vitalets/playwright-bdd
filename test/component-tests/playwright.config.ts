import { defineConfig } from '@playwright/experimental-ct-react';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  paths: ['features'],
  require: ['steps/steps.tsx'],
});

export default defineConfig({
  testDir,
  timeout: 5 * 1000,
  use: {
    screenshot: 'only-on-failure',
  },
});
