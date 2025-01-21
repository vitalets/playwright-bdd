import { EyesFixture } from '@applitools/eyes-playwright/fixture';
import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features',
  steps: 'features/steps/*.ts',
});

// before playwright-bdd v7
/*
const testDir = defineBddConfig({
  paths: ['features'],
  require: ['features/steps/*.ts'],
  importTestFrom: 'features/steps/fixtures.ts',
});
*/

export default defineConfig<EyesFixture>({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'cucumber-report/report.html' })],
  use: {
    eyesConfig: {
      appName: 'Playwright with Cucumber bdd example',
      isDisabled: !process.env.APPLITOOLS_API_KEY, // disable Applitools if api key is not set
    },
  },
});
