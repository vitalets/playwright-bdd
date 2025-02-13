import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
});

const workers = Number(process.env.WORKERS);
const fullyParallel = Boolean(process.env.FULLY_PARALLEL);

export default defineConfig({
  testDir,
  workers,
  fullyParallel,
  reporter: [
    cucumberReporter('message', {
      outputFile: `actual-reports/report-workers-${workers}.jsonl`,
    }),
    cucumberReporter('html', {
      outputFile: `actual-reports/report-workers-${workers}.html`,
    }),
  ],
});
