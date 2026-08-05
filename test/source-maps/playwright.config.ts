import { defineConfig } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
  sourceMaps: true,
});

export default defineConfig({
  testDir,
  reporter: [
    ['line'],
    ['../_helpers/rawJsonReporter.ts', { outputDir: 'actual-reports/raw-json' }],
    cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' }),
  ],
});
