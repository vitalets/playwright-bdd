# Component tests
Playwright-bdd supports [component tests](https://playwright.dev/docs/test-components)
since Playwright **1.39**.

Initialize components testing [per instruction](https://playwright.dev/docs/test-components#how-to-get-started):
```
npm init playwright@latest -- --ct
```

Update `playwright-ct.config.ts`:
```diff
import { defineConfig, devices } from '@playwright/experimental-ct-react';
+ import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
-  testDir: './',
+  testDir: defineBddConfig({
+    importTestFrom: 'fixtures.ts',
+    paths: ['features/*.feature'],
+    require: ['steps.tsx'],
+  }),

// ...
```

Create `fixtures.ts` file that exports custom `test`:
```ts
import { mergeTests } from '@playwright/test';
import { test as ctBase } from '@playwright/experimental-ct-react';
import { test as base } from 'playwright-bdd';

export const test = mergeTests(base, ctBase);
```

Define steps in `steps.tsx`:
```ts
import React from 'react';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

Given('Mounted input component', async ({ mount }) => {
  await mount(<input type="text" data-testid="textField" />);
});

When('I type {string}', async ({ page }, arg: string) => {
  await page.getByTestId('textField').fill(arg);
});

Then('input field has {string}', async ({ page }, arg: string) => {
  await expect(page.getByTestId('textField')).toHaveValue(arg);
});
```

Create feature file `input.feature`:
```gherkin
Feature: input component

    Scenario: Mount component and interact with it
        Given Mounted input component
        When I type "ABC"
        Then input field has "ABC"
```

Update `test-ct` command in `package.json` to generate BDD tests before running Playwright:
```diff
  "scripts": {
-    "test-ct": "playwright test -c playwright-ct.config.ts"
+    "test-ct": "npx bddgen -c playwright-ct.config.ts && playwright test -c playwright-ct.config.ts"
  },
```

Finally, run tests:
```
npm run test-ct
```