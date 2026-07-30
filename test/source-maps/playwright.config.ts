import { defineConfig } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const sourceMaps =
  process.env.TEST_SOURCE_MAPS === undefined
    ? {}
    : { sourceMaps: process.env.TEST_SOURCE_MAPS === 'true' };

const testDir = defineBddConfig({
  featuresRoot: 'features',
  ...sourceMaps,
});

export default defineConfig({
  testDir,
  reporter: [
    ['line'],
    cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' }),
  ],
});
