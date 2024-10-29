import { defineConfig } from '@playwright/test';
import { defineBddProject, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  workers: 1,
  projects: [
    {
      ...defineBddProject({
        name: 'hooks-fixtures-pw-style',
        features: 'features',
        steps: 'features/pw-style',
      }),
    },
    {
      ...defineBddProject({
        name: 'hooks-fixtures-cucumber-style',
        features: 'features',
        steps: 'features/cucumber-style',
      }),
    },
  ],
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
