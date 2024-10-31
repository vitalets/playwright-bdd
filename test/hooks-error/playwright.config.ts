import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  workers: 1,
  // reporter: [
  //   cucumberReporter('html', { outputFile: `actual-reports/${process.env.ERROR}/report.html` }),
  // ],
});
