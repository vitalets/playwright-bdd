import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures',
  paths: ['features'],
  require: ['steps/*.ts'],
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
  reporter: 'html',
});
