# Add fixtures

As your tests grow, you will most likely need some Playwright [fixtures](https://playwright.dev/docs/test-fixtures). That means you will use custom `test` instance, created with `test.extend()`. For such cases you should pass custom test instance into `createBdd()` function to have access to all your fixtures inside step definitions.

The recommended setup is to call `createBdd(test)` in the same file where you define custom test and export `test` and `Given / When / Then`:

```ts
// fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({
  myFixture: // ... define your fixture here
});

export const { Given, When, Then } = createBdd(test);
```

> Make sure to export `test` variable, because it is used in generated test files

Now you can write step definitions with custom fixtures:
```ts
// steps.ts

import { Given, When, Then } from './fixtures';

Given('My step', async ({ myFixture }) => {
  // step code that uses myFixture
});
```