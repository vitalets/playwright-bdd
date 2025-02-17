import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const { FEATURE = '' } = process.env;

const testDir = defineBddConfig({
  featuresRoot: 'features',
  features: `features/${FEATURE}.feature`,
});

export default defineConfig({
  testDir,
  reporter: [
    ['html', { open: 'never' }],
    cucumberReporter('html', { outputFile: `actual-reports/${FEATURE}/report.html` }),
    [
      '../_helpers/stepsReporter.ts',
      {
        outputFile: `actual-reports/${FEATURE}/steps.txt`,
        categories: ['hook', 'test.step', 'attach', 'expect'],
      },
    ],
  ],
});
