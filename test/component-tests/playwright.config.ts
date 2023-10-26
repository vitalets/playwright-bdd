import { defineConfig } from '@playwright/experimental-ct-react';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  paths: ['features'],
  require: ['steps/steps.tsx'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
