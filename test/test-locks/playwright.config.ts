import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  testDir: defineBddConfig({
    featuresRoot: 'features',
    tags: process.env.LOCK_TAGS,
    features: `features/${process.env.LOCK_FEATURES || 'lock-in-step.feature'}`,
    missingSteps: process.env.LOCK_MISSING === 'fail-on-run' ? 'fail-on-run' : 'skip-scenario',
    quotes: process.env.LOCK_QUOTES as 'single' | 'double' | 'backtick' | undefined,
  }),
});
