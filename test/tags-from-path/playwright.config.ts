import { defineConfig } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' })],
  workers: Number(process.env.WORKERS) || undefined,
});
