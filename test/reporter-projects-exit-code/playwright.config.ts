import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'failing-auth',
      testDir: 'features',
      testMatch: /auth\.ts/,
    },
    {
      name: 'chromium',
      testDir: defineBddConfig({
        features: 'features/*.feature',
        steps: 'features/steps.ts',
      }),
      dependencies: ['failing-auth'],
    },
  ],
  reporter: [
    cucumberReporter('message', { outputFile: 'actual-reports/message.ndjson' }),
    cucumberReporter('junit', { outputFile: 'actual-reports/report.xml' }),
  ],
});
