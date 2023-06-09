import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist/index.js';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures',
  paths: ['*.feature'],
  import: ['steps.js'], // <- note import instead of require
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
