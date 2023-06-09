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
        requireModule: ['ts-node/register'],
      }),
    },
    {
      name: 'project two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        importTestFrom: 'two/fixtures.ts',
        paths: ['two/*.feature'],
        require: ['two/steps.ts'],
        requireModule: ['ts-node/register'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
