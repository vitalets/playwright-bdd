import { defineConfig } from '@playwright/test';
import { defineBddConfig, BDDInputConfig } from '../../dist';

const testDir = defineBddConfig({
  quotes: process.env.QUOTES as BDDInputConfig['quotes'],
  outputDir: `.features-gen/${process.env.QUOTES}`,
  paths: ['*.feature'],
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
