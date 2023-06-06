import { defineConfig } from '@playwright/test';
import { generateBDDTests } from '../../dist';

const testDir = generateBDDTests({
  paths: ['../bdd-syntax/features'],
  require: ['steps.ts'],
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
  testIgnore: 'only-skip-fixme.feature.spec.js',
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
