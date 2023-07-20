import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        importTestFrom: 'one/fixtures.ts',
        paths: ['one/*.feature'],
        require: ['one/steps.ts'],
      }),
    },
    {
      name: 'project two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        importTestFrom: 'two/fixtures.ts',
        paths: ['two/*.feature'],
        require: ['one/steps.ts', 'two/steps.ts'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
