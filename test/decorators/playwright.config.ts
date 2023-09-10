import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  paths: ['features/*.feature'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
