import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['features/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('./custom-reporter.ts', {
      outputFile: 'actual-reports/custom.ndjson',
      foo: 'bar',
    }),
    cucumberReporter('@cucumber/pretty-formatter', {
      theme: {
        scenario: { name: ['blue'] },
        step: { text: ['magenta'] },
        tag: ['green'],
      },
    }),
  ],
});
