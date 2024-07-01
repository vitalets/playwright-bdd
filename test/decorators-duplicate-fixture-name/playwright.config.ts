import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: [`sample.feature`],
  steps: 'fixtures.ts',
});

export default defineConfig({
  testDir,
});
