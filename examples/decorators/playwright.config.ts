import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  paths: ['features'],
});

export default defineConfig({
  testDir,
  reporter: 'html',
  timeout: 10 * 1000,
});
