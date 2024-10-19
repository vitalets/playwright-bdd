import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: '*.feature',
  steps: 'steps/index.ts',
});

export default defineConfig({
  testDir,
});
