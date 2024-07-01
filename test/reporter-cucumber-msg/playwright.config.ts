import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const featureDir = process.env.FEATURE_DIR;
if (!featureDir) throw new Error(`Empty FEATURE_DIR`);

const testDir = defineBddConfig({
  outputDir: `features/${featureDir}/.features-gen`,
  paths: [`features/${featureDir}`],
  // there are also cucumber.steps.ts that are used to generate golden reports
  require: [
    `features/fixtures.ts`,
    `features/${featureDir}/common.steps.ts`,
    `features/${featureDir}/pw.steps.ts`,
  ],
});

export default defineConfig({
  testDir,
  retries: featureDir === 'retry' ? 2 : 0,
  reporter: [
    cucumberReporter('message', {
      outputFile: `features/${featureDir}/actual-reports/messages.ndjson`,
    }),
    cucumberReporter('json', {
      outputFile: `features/${featureDir}/actual-reports/json-report.json`,
    }),
    featureDir === 'attachments' ? jsonReporterNoAttachments() : null,
  ].filter((r): r is NonNullable<typeof r> => Boolean(r)),
});

function jsonReporterNoAttachments() {
  return cucumberReporter('json', {
    outputFile: `features/${featureDir}/actual-reports/json-report-no-attachments.json`,
    skipAttachments: true,
  });
}
