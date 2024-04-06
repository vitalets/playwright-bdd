import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'steps/index.ts',
  paths: ['*.feature'],
});

export default defineConfig({
  testDir,
});
