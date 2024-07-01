import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'pw-style-success',
      testDir: defineBddConfig({
        outputDir: '.features-gen/pw-style-success',
        paths: ['features/*.feature'],
        require: ['steps-pw-style/*.ts'],
        tags: '@success',
      }),
    },
    {
      name: 'pw-style-invalid-invocation',
      testDir: defineBddConfig({
        outputDir: '.features-gen/pw-style-invalid-invocation',
        paths: ['features/*.feature'],
        require: ['steps-pw-style/*.ts'],
        tags: '@error',
      }),
    },
    {
      name: 'cucumber-style-success',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style-success',
        paths: ['features/*.feature'],
        require: ['steps-cucumber-style/*.ts'],
        tags: '@success',
      }),
    },
  ],
});
