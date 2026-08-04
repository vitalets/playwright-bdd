import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const lockFile = process.env.BDDGEN_TEST_LOCK_FILE !== 'false';
const testDir = defineBddConfig({
  featuresRoot: './features',
  ...(lockFile ? {} : { lockFile: false }),
});

export default defineConfig({ testDir });
