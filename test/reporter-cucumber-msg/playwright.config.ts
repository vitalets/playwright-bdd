import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const featureDir = process.env.FEATURE_DIR;
if (!featureDir) throw new Error(`Empty FEATURE_DIR`);

const testDir = defineBddConfig({
  outputDir: `.features-gen/${featureDir}`,
  paths: [`features/${featureDir}`],
  require: [`features/${featureDir}/common.steps.ts`, `features/${featureDir}/pw.steps.ts`],
});

export default defineConfig({
  testDir,
  retries: featureDir === 'retry' ? 2 : 0,
  reporter: [
    cucumberReporter('message', {
      outputFile: `features/${featureDir}/reports/messages.ndjson`,
    }),
    cucumberReporter('json', {
      outputFile: `features/${featureDir}/reports/json-report.json`,
    }),
  ],
});
