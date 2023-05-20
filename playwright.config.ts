import { defineConfig } from '@playwright/test';

export default defineConfig({
  forbidOnly: Boolean(process.env.FORBID_ONLY),
  projects: [
    { name: 'generated-tests', testDir: '.features-gen', testIgnore: 'only-skip-fixme.feature.spec.js' },
    { name: 'parse-error', testDir: 'test/parse-error' },
    { name: 'undefined-step', testDir: 'test/undefined-step' },
  ],
});
