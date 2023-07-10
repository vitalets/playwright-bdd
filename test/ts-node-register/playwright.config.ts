import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures.ts',
  paths: ['*.feature'],
  require: ['steps.ts'],
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
