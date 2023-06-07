import { defineConfig } from '@playwright/test';
import { generateBDDTests } from '../../dist/index.js';

const testDir = generateBDDTests({
  importTestFrom: 'fixtures',
  paths: ['*.feature'],
  import: ['steps.ts'], // <- note import instead of require
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
