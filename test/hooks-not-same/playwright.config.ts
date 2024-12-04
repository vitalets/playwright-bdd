import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

export default defineConfig({
  projects: [
    ...(process.env.ERROR_IN_WORKER_THREAD ? [defineValidProject()] : []),
    defineErrorProject(),
  ],
});

function defineValidProject() {
  return defineBddProject({
    name: 'valid-project-main-thread',
    featuresRoot: './features',
    steps: './features/steps.ts',
  });
}

function defineErrorProject() {
  return defineBddProject({
    name: 'error-project',
    featuresRoot: './features',
    steps: './features/*.ts',
  });
}
