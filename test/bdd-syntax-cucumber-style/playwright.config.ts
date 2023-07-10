import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  paths: ['../bdd-syntax/features'],
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
  testIgnore: 'only-skip-fixme.feature.spec.js',
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
