import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [getProject(process.env.PROJECT)],
});

// todo: use --project flag from bddgen
function getProject(projectName?: string) {
  switch (projectName) {
    case 'ambiguos-test-instance':
      return {
        name: 'ambiguos-test-instance',
        testDir: defineBddConfig({
          outputDir: '.features-gen/ambiguos-test-instance',
          features: 'ambiguos-test-instance',
          steps: 'ambiguos-test-instance/*.ts',
        }),
      };
    case 'missing-test-instance':
      return {
        name: 'missing-test-instance',
        testDir: defineBddConfig({
          outputDir: '.features-gen/missing-test-instance',
          features: 'missing-test-instance',
          steps: [
            'missing-test-instance/steps.ts',
            'missing-test-instance/fixtures2.ts', // missing 'fixtures.ts'!
          ],
        }),
      };
  }

  throw new Error(`Invalid porject name "${projectName}"`);
}
