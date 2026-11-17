import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  testDir: defineBddConfig({
    features: 'features/**/*.feature',
    steps: 'features/*.ts',
  }),
  webServer: {
    command: 'npm run dev',
    env: { NO_COLOR: '1', FORCE_COLOR: '0' },
    wait: { stdout: /Local:\s+(?<APP_URL>http:\/\/\S+)/ },
  },
});
