import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        importTestFrom: 'fixtures.ts',
        paths: ['one/*.feature'],
        require: ['steps.ts'],
        requireModule: ['ts-node/register'],
      }),
    },
    {
      name: 'project two',
      testDir: defineBddConfig({
        importTestFrom: 'fixtures.ts',
        paths: ['two/*.feature'],
        require: ['steps.ts'],
        requireModule: ['ts-node/register'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
