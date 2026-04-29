import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const featuresDir = process.env.FEATURES_DIR;

if (!featuresDir) {
  throw new Error(`FEATURES_DIR env variable is required`);
}

const testDir = defineBddConfig({
  paths: [`features/${featuresDir}/**/*.feature`],
  require: [`features/${featuresDir}/**/*.ts`],
});

export default defineConfig({
  testDir,
});
