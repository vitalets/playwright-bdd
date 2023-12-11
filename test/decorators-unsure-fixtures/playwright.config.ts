import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures/index.ts',
  paths: [`features/${process.env.FEATURE}`],
});

export default defineConfig({
  testDir,
});
