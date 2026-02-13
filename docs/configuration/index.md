# Configuration

> [List of available options](configuration/options.md).

Configuration is passed to `defineBddConfig()` inside the Playwright config file.
The return value of `defineBddConfig()` is a resolved output directory where test files will be generated. It is convenient to use it as the `testDir` option for Playwright.

Example configuration in `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'feature/*.feature',
  steps: 'steps/**/*.ts',
  // ...other playwright-bdd options
});

export default defineConfig({
  testDir,
  // ...other playwright options
});
```

All relative paths are resolved from the config file location.