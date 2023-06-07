import { defineConfig } from '@playwright/test';
import { generateBDDTests } from '../../dist/index.js';

const testDir = generateBDDTests({
  importTestFrom: 'fixtures',
  paths: ['*.feature'],
  import: ['steps.js'], // <- note import instead of require
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
