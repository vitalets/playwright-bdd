import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  reporter: [['./reporter.ts']],
  // for debug
  // reporter: 'html',
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        importTestFrom: 'steps/fixtures.ts',
        paths: ['*.feature'],
        import: ['steps/*.ts'], // <- note 'import' instead of 'require'
      }),
    },
    {
      name: 'project two',
      dependencies: ['project one'],
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        importTestFrom: 'project-two/steps/fixtures.ts',
        paths: ['project-two/*.feature'],
        import: ['steps/*.ts', 'project-two/steps/*.ts'],
      }),
    },
  ],
});
