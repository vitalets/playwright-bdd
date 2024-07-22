# Configuration

Configuration is passed to `defineBddConfig()` inside Playwright config file.
Return value of `defineBddConfig()` is a resolved output directory where test files will be generated. It is convenient to use it as a `testDir` option for Playwright.

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
});
```

All relative paths are resolved from config file location.
