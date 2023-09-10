import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures/index.ts',
  paths: [`features/${process.env.FEATURE}`],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
