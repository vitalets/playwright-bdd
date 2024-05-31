import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['steps/*.ts'],
  importTestFrom: 'steps/fixtures',
});

export default defineConfig({
  testDir,
});
