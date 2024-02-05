import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const featureDir = process.env.FEATURE_DIR;
if (!featureDir) throw new Error(`Empty FEATURE_DIR`);

const testDir = defineBddConfig({
  paths: [`features/${featureDir}`],
  require: [`features/${featureDir}/*.ts`],
  bddAttachments: true,
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('message', {
      outputFile: `features/${featureDir}/report.ndjson`,
    }),
    cucumberReporter('json', {
      outputFile: `features/${featureDir}/report.json`,
    }),
  ],
});
