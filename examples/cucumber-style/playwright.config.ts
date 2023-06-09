import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features'],
  require: ['steps/*.ts'],
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
  reporter: 'html',
});
