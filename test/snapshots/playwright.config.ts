import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  paths: ['*.feature'],
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
  outputDir: './test-results',
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
