import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

function getTestDir() {
  switch (process.env.TEST_NAME) {
    case 'no-extension-js':
      return defineBddConfig({
        features: 'features',
        steps: 'steps-js/steps.js',
        importTestFrom: 'steps-js/fixtures',
        disableWarnings: { importTestFrom: true },
      });
    case 'no-extension-ts':
      return defineBddConfig({
        features: 'features',
        steps: 'steps-ts/steps.ts',
        importTestFrom: 'steps-ts/fixtures',
        disableWarnings: { importTestFrom: true },
      });
    case 'with-extension-ts':
      return defineBddConfig({
        features: 'features',
        steps: 'steps-ts/steps.ts',
        importTestFrom: 'steps-ts/fixtures.ts',
        disableWarnings: { importTestFrom: true },
      });
  }
}

export default defineConfig({
  testDir: getTestDir(),
});
