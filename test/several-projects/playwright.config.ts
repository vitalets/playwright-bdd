import { defineConfig } from '@playwright/test';
import { generateBDDTests } from '../../dist';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: generateBDDTests({
        outputDir: '.features-gen/one',
        importTestFrom: 'fixtures.ts',
        paths: ['one/*.feature'],
        require: ['steps.ts'],
        requireModule: ['ts-node/register'],
      }),
    },
    {
      name: 'project two',
      testDir: generateBDDTests({
        outputDir: '.features-gen/two',
        importTestFrom: 'fixtures.ts',
        paths: ['two/*.feature'],
        require: ['steps.ts'],
        requireModule: ['ts-node/register'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
