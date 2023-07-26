import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

export default defineConfig({
  projects: [
    {
      name: 'project-one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        importTestFrom: 'one/steps/fixtures.ts',
        paths: ['one/*.feature'],
        require: ['one/steps/*.ts'],
      }),
    },
    {
      name: 'project-two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        importTestFrom: 'two/steps/fixtures.ts',
        paths: ['two/*.feature'],
        require: ['one/steps/*.ts', 'two/steps/*.ts'],
      }),
      dependencies: ['project-one'],
    },
    {
      name: 'project-three',
      testDir: defineBddConfig({
        outputDir: '.features-gen/three',
        importTestFrom: 'two/steps/fixtures.ts',
        paths: ['two/*.feature'],
        require: ['one/steps/*.ts', 'two/steps/*.ts'],
      }),
      dependencies: ['project-one'],
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
