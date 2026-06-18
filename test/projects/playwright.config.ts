import { defineConfig } from '@playwright/test';
import { defineBddProject, cucumberReporter } from 'playwright-bdd';

// Exporting const from config and importing in test is shown in Playwright docs.
// This leads to re-evaluation of config in worker and re-call of defineBddConfig().
// Playwright-bdd handles this correctly now.
// See: https://playwright.dev/docs/test-global-setup-teardown#setup-example
// See: https://github.com/vitalets/playwright-bdd/issues/39#issuecomment-1653805368
export const FOO = 'foo';

export default defineConfig({
  reporter: [
    ['line'], // prettier-ignore
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
  ],
  projects: [
    {
      ...defineBddProject({
        name: 'project-one',
        features: ['one/*.feature'],
        steps: ['one/steps/fixtures.ts', 'one/steps/steps-*.ts'],
      }),
    },
    {
      ...defineBddProject({
        name: 'project-two',
        features: ['two/*.feature'],
        steps: ['two/steps/fixtures.ts', 'one/steps/steps-shared.ts', 'two/steps/steps.ts'],
      }),
      dependencies: ['project-one'],
    },
    {
      ...defineBddProject({
        name: 'project-two-copy',
        features: ['two/*.feature'],
        steps: ['two/steps/fixtures.ts', 'one/steps/steps-shared.ts', 'two/steps/steps.ts'],
      }),
      dependencies: ['project-one'],
    },
    {
      name: 'non-bdd-project',
      testDir: 'non-bdd',
    },
  ],
});
