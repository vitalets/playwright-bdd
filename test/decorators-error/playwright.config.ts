import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: [`features/${process.env.FEATURE}`],
  require: ['../decorators/steps/*.ts'],
  statefulPoms: true,
});

export default defineConfig({
  testDir,
});
