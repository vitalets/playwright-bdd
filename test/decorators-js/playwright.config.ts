import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  steps: 'steps/*',
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
  // @ts-expect-error non-public field
  '@playwright/test': {
    babelPlugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
  },
});
