import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: './features',
});

export default defineConfig({
  testDir,
  reporter: [
    [
      '../_helpers/stepsReporter.ts',
      {
        outputFile: 'actual-reports/report.txt',
        titles: ['fixture: $beforeEach', 'fixture: $afterEach', 'page.goto(https://example.com)'],
      },
    ],
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
    ['html', { open: 'never' }],
  ],
  use: {
    screenshot: 'on',
    trace: 'on',
  },
});
