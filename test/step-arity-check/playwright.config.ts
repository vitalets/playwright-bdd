import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const featuresDir = process.env.FEATURES_DIR;

if (!featuresDir) {
  throw new Error(`FEATURES_DIR env variable is required`);
}

const testDir = defineBddConfig({
  features: [`features/${featuresDir}/**/*.feature`],
  steps: [`features/${featuresDir}/**/*.ts`],
  arityCheck: process.env.ARITY_CHECK === 'false' ? false : undefined,
});

export default defineConfig({
  testDir,
});
