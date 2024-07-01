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

    case 'missing-test-instance-decorator':
      return {
        name: 'missing-test-instance-decorator',
        testDir: defineBddConfig({
          outputDir: '.features-gen/missing-test-instance-decorator',
          features: 'missing-test-instance-decorator',
          steps: [
            'missing-test-instance-decorator/TodoPage.ts',
            'missing-test-instance-decorator/fixtures2.ts', // missing 'fixtures.ts'!
          ],
        }),
      };

    case 'no-test-instances':
      return {
        name: 'no-test-instances',
        testDir: defineBddConfig({
          outputDir: '.features-gen/no-test-instances',
          features: 'no-test-instances',
          steps: [
            'no-test-instances/steps.ts',
            // missing 'fixtures.ts'!
          ],
        }),
      };
  }

  throw new Error(`Invalid porject name "${projectName}"`);
}
