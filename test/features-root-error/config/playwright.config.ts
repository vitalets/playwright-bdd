import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../../dist';

const testDir = defineBddConfig({
  paths: ['../root.feature'],
  require: ['../steps.ts'],
  outputDir: '../.features-gen',
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
