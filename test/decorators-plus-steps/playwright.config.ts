import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  paths: ['*.feature'],
  require: ['steps/index.ts'],
});

export default defineConfig({
  testDir,
});
