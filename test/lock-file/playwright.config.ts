import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const lockFile = process.env.BDDGEN_TEST_LOCK_FILE === 'true';
const testDir = defineBddConfig({
  featuresRoot: './features',
  ...(lockFile ? { lockFile: true } : {}),
});

export default defineConfig({ testDir });
