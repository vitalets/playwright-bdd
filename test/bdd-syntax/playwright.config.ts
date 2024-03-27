import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  // ignore b/c it contains test.only
  testIgnore: 'only-skip-fixme.feature.spec.js',
  projects: [
    {
      name: 'pw-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/pw-style',
        paths: ['features'],
        require: ['steps-pw-style/steps.ts'],
        importTestFrom: 'steps-pw-style/fixtures.ts',
      }),
    },
    {
      name: 'cucumber-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style',
        paths: ['features'],
        require: ['steps-cucumber-style/steps.ts'],
      }),
    },
  ],
});
