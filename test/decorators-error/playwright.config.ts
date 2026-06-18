import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: [`features/${process.env.FEATURE}`],
  steps: ['../decorators/steps/*.ts'],
  statefulPoms: true,
});

export default defineConfig({
  testDir,
});
