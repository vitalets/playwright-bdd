# Add fixtures

As your tests count grows, you will most likely need some Playwright [fixtures](https://playwright.dev/docs/test-fixtures). That means you will use custom test instance, created with `test.extend()`. For such cases you should pass custom test instance into `createBdd()` function to have access to all your fixtures in step definitions.

The recommended setup is to call `createBdd()` in the same file where you define custom test and export `Given / When / Then`:

```ts
// fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({
  myFixture: // ... define your fixtures here
});

export const { Given, When, Then } = createBdd(test);
```

Then use these `Given / When / Then` in step definitions:
```ts
// steps.ts

import { Given, When, Then } from './fixtures';

Given('I open url {string}', async ({ page, myFixture }, url) => {
  // you can use myFixture here
});
```