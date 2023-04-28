import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'generated-tests', testDir: 'test/.features-gen', testIgnore: 'only-skip-fixme.feature.spec.js' },
    { name: 'custom-world', testDir: 'test/custom-world' },
    { name: 'parse-error', testDir: 'test/parse-error' },
    { name: 'undefined-step', testDir: 'test/undefined-step' },
    { name: 'custom-fixtures', testDir: 'test/custom-fixtures' },
  ],
});
