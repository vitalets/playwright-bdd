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
        titles: [/fixture: \$beforeEach$/, /fixture: \$afterEach$/, 'page.goto', 'Navigate'],
        // useful to debug:
        // categories: null,
      },
    ],
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
    ['html', { open: 'never' }],
  ],
  use: {
    screenshot: { mode: 'on', fullPage: true },
    trace: 'on',
  },
});
