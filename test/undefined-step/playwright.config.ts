import { defineConfig } from '@playwright/test';
import { generateBDDTests } from '../../dist';

const testDir = generateBDDTests({
  paths: ['*.feature'],
  require: ['steps.ts'],
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
