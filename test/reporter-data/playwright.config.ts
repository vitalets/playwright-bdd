import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: './features',
});

export default defineConfig({
  testDir,
  reporter: [
    ['./reporter.ts', { outputFile: 'actual-reports/report.txt' }],
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
    ['html', { open: 'never' }],
  ],
  use: {
    screenshot: 'on',
    trace: 'on',
  },
});
