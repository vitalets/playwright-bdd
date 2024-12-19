import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

const { PROJECTS = '' } = process.env;

export default defineConfig({
  projects: [
    ...(PROJECTS.includes('project1')
      ? [
          defineBddProject({
            name: 'project1',
            featuresRoot: 'project1',
          }),
        ]
      : []),

    ...(PROJECTS.includes('project2')
      ? [
          defineBddProject({
            name: 'project2',
            featuresRoot: 'project2',
            features: 'project2/*.feature',
            steps: 'project2/*.ts',
          }),
        ]
      : []),
  ],
});
