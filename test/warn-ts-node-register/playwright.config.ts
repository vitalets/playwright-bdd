import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures.ts',
  paths: ['*.feature'],
  require: ['steps.ts'],
  requireModule: ['ts-node/register'], // <- triggers warning
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
