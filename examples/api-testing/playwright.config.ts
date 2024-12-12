import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'cucumber-report/index.html' })],
  use: {
    // All requests we send go to this API endpoint.
    baseURL: 'https://jsonplaceholder.typicode.com',
    extraHTTPHeaders: {
      // Add authorization token to all requests.
      // Assuming personal access token available in the environment.
      // Authorization: `token ${process.env.API_TOKEN}`,
    },
  },
});
