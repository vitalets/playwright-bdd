# Reporters

All [Playwright reporters](https://playwright.dev/docs/test-reporters) are supported out-of-box. Define `reporter` option in `playwright.config.ts` as usual:

```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'sample.feature',
  steps: 'steps.js',
});

export default defineConfig({
  testDir,
  reporter: 'html', // <- define reporter as usual
});
```

If you need more BDD-adopted reports, have a look on [Cucumber reporters](reporters/cucumber.md).

