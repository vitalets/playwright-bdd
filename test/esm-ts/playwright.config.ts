import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist/index.js';

export default defineConfig({
  reporter: [['./reporter.ts']],
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
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
