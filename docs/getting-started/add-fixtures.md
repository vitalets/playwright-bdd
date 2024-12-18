# Add fixtures

As your tests grow, you will most likely need some Playwright [fixtures](https://playwright.dev/docs/test-fixtures). This means you will use a custom `test` instance, created with `test.extend()`. For such cases, you should pass the custom test instance into the `createBdd()` function to have access to all your fixtures inside step definitions.

### Recommended setup

Call `createBdd(test)` in the same file where you define the custom test and export `test` and `Given / When / Then`:

```ts
// fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({
  myFixture: async ({ page }, use) => {
    // ... define your fixture here
  }
});

export const { Given, When, Then } = createBdd(test);
```

> Make sure to export the `test` variable, because it is used in generated test files.

Now you can write step definitions with custom fixtures:

```ts
// steps.ts

import { Given, When, Then } from './fixtures';

Given('My step', async ({ myFixture }) => {
  // step code that uses myFixture
});
```