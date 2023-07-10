import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  paths: ['features'],
  require: ['steps/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: 'html',
});
