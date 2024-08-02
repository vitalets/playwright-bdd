import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export const AUTH_FILE = 'playwright/.auth/user.json';

export default defineConfig({
  projects: [
    {
      name: 'auth',
      testDir: 'features',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testDir: defineBddConfig({
        features: 'features/*.feature',
        steps: 'features/steps/*.ts',
      }),
      use: {
        storageState: AUTH_FILE,
      },
      dependencies: ['auth'],
    },
  ],
  reporter: [cucumberReporter('html', { outputFile: 'cucumber-report/report.html' })],
});
