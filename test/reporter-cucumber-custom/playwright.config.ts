import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['features/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('./custom-reporter.ts', {
      outputFile: 'actual-reports/custom.ndjson',
      foo: 'bar',
    }),
    cucumberReporter('@cucumber/pretty-formatter', {
      colorsEnabled: true,
      theme: {
        'scenario name': ['blue'],
        'step text': ['magenta'],
        tag: ['green'],
      },
    }),
  ],
});
