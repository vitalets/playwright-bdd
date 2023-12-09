import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['../bdd-syntax/features'],
  featuresRoot: '../bdd-syntax/features',
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
  testIgnore: 'only-skip-fixme.feature.spec.js',
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
