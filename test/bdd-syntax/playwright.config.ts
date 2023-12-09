import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  paths: ['features'],
  require: ['steps/steps.ts'],
});

export default defineConfig({
  testDir,
  testIgnore: 'only-skip-fixme.feature.spec.js',
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
