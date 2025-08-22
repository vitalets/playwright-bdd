import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { testTimeout } from './timeout';

const testDir = defineBddConfig({
  featuresRoot: './features',
  steps: ['./features/**/*.ts', '!**/*.spec.ts'],
  // usefull for debug
  // features: './features/after-hook',
});

export default defineConfig({
  testDir,
  reporter: [
    ['dot'],
    ['blob'],
    cucumberReporter('message', { outputFile: 'actual-reports/message.ndjson' }),
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
    ['../_helpers/rawJsonReporter.ts', { outputDir: 'actual-reports/raw-json' }],
  ],
  use: {
    screenshot: { mode: 'only-on-failure', fullPage: true },
    trace: 'retain-on-failure',
  },
  timeout: testTimeout,
  expect: {
    timeout: 1,
  },
});
