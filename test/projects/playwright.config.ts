import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// Exporting const from config and importing in test is shown in Playwright docs.
// This leads to re-evaluation of config in worker and re-call of defineBddConfig().
// Playwright-bdd handles this correctly now.
// See: https://playwright.dev/docs/test-global-setup-teardown#setup-example
// See: https://github.com/vitalets/playwright-bdd/issues/39#issuecomment-1653805368
export const FOO = 'foo';

export default defineConfig({
  reporter: 'line',
  projects: [
    {
      name: 'project-one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        paths: ['one/*.feature'],
        require: ['one/steps/fixtures.ts', 'one/steps/steps-*.ts'],
      }),
    },
    {
      name: 'project-two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        paths: ['two/*.feature'],
        require: ['two/steps/fixtures.ts', 'one/steps/steps-shared.ts', 'two/steps/steps.ts'],
      }),
      dependencies: ['project-one'],
    },
    {
      name: 'project-two-copy',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two-copy',
        paths: ['two/*.feature'],
        require: ['two/steps/fixtures.ts', 'one/steps/steps-shared.ts', 'two/steps/steps.ts'],
      }),
      dependencies: ['project-one'],
    },
    {
      name: 'non-bdd-project',
      testDir: 'non-bdd',
    },
  ],
});
