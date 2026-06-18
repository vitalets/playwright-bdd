import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const TAG = process.env.TAG; // @success, @error

export default defineConfig({
  projects: [
    {
      name: 'pw-style',
      testDir: defineBddConfig({
        outputDir: `.features-gen/pw-style-${TAG}`,
        features: ['features/*.feature'],
        steps: ['steps-pw-style/*.ts'],
        tags: TAG,
      }),
    },
    {
      name: 'cucumber-style',
      testDir: defineBddConfig({
        outputDir: `.features-gen/cucumber-style-${TAG}`,
        features: ['features/*.feature'],
        steps: ['steps-cucumber-style/*.ts'],
        tags: TAG,
      }),
    },
    {
      name: 'pw-style-world',
      testDir: defineBddConfig({
        outputDir: `.features-gen/pw-style-world-${TAG}`,
        features: ['features/*.feature'],
        steps: ['steps-pw-style-world/*.ts'],
        verbose: true,
        tags: TAG,
      }),
    },
  ],
});
