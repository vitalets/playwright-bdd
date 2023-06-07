import { defineConfig } from '@playwright/test';
import { generateBDDTests } from 'playwright-bdd';

const testDir = generateBDDTests({
  importTestFrom: 'steps/fixtures',
  paths: ['features'],
  require: ['steps/*.ts'],
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
});
