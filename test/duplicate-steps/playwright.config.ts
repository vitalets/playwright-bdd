import { defineConfig, Project } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const PROJECTS = (process.env.PROJECTS || '').split(',');

export default defineConfig({
  projects: [
    ...(PROJECTS.includes('no-duplicates') ? [noDuplicates()] : []),
    ...(PROJECTS.includes('duplicate-regular-steps') ? [duplicateRegularSteps()] : []),
    ...(PROJECTS.includes('duplicate-decorator-steps') ? [duplicateDecoratorSteps()] : []),
  ],
});

function noDuplicates(): Project {
  return {
    // this project must be first and is needed to run the second project in a worker
    name: 'no-duplicates',
    testDir: defineBddConfig({
      outputDir: `.features-gen/no-duplicates`,
      paths: ['features/*.feature'],
      steps: ['steps/steps.ts'],
      tags: '@no-duplicates',
    }),
  };
}

function duplicateRegularSteps(): Project {
  return {
    name: 'duplicate-regular-steps',
    testDir: defineBddConfig({
      outputDir: `.features-gen/regular`,
      paths: ['features/*.feature'],
      steps: ['steps/steps.ts'],
      tags: '@duplicate-regular-steps',
    }),
  };
}

function duplicateDecoratorSteps(): Project {
  return {
    name: 'duplicate-decorator-steps',
    testDir: defineBddConfig({
      outputDir: `.features-gen/decorator`,
      paths: ['features/*.feature'],
      steps: 'steps/fixtures.ts',
      tags: '@duplicate-decorator-steps',
    }),
  };
}
