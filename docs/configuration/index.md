# Configuration

Configuration is passed to `defineBddConfig()` inside Playwright config file.
Some options are identical to [CucumberJS options](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#options) and some are special for `playwright-bdd`.

Return value of `defineBddConfig()` is a resolved output directory where test files will be generated. It is convenient to use it as a `testDir` option for Playwright.

Example configuration in `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['feature/*.feature'],
  require: ['steps/**/*.ts'],
  importTestFrom: 'fixtures.ts',
  // ...other playwright-bdd options
});

export default defineConfig({
  testDir,
});
```

All relative paths are resolved from config file location.

> If there is `cucumber.js` config file (next to `playwright.config.ts`), it is also merged into configuration.