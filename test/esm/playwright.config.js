import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        importTestFrom: 'fixtures.js',
        paths: ['*.feature'],
        import: ['steps.js'], // <- note 'import' instead of 'require'
      }),
    },
    {
      name: 'project two',
      dependencies: ['project one'],
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        importTestFrom: 'project-two/fixtures.js',
        paths: ['project-two/*.feature'],
        import: ['steps.js', 'project-two/steps.js'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
