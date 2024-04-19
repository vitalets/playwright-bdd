import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: [`features/${process.env.FEATURE}`],
  importTestFrom: '../decorators/steps/fixtures.ts',
  require: ['../decorators/steps/steps.ts'],
  statefulPoms: true,
});

export default defineConfig({
  testDir,
});
