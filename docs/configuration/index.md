# Configuration

> [List of available options](configuration/options.md).

Playwright-BDD is configured in the Playwright config file, e.g. `playwright.config.ts|js`. You pass options to `defineBddConfig()`, that returns a `testDir` output path, where test files will be generated.

Example:
```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
  // ...other playwright-bdd options
});

export default defineConfig({
  testDir,
  // ...other playwright options
});
```

All relative paths are resolved from the config file location.