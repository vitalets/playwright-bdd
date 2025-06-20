import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: `features`,
  aiFix: {
    promptAttachment: true,
  },
});

export default defineConfig({
  testDir,
});
