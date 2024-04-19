import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  importTestFrom: 'steps/fixtures.ts',
  require: ['steps/steps.ts'],
});

export default defineConfig({
  testDir,
});
