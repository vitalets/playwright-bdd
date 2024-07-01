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
        steps: 'steps-pw-style/*.ts',
      }),
    },
    {
      name: 'cucumber-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style',
        paths: ['features'],
        steps: 'steps-cucumber-style/*.ts',
      }),
    },
  ],
});
