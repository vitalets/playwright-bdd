# Component tests

Playwright-BDD supports [component tests](https://playwright.dev/docs/test-components) since Playwright **1.39**.

#### Initialize components testing

Follow the [Playwright instructions](https://playwright.dev/docs/test-components#how-to-get-started):

```
npm init playwright@latest -- --ct
```

#### Add Playwright-BDD configuration

Update `playwright-ct.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['fixtures.ts', 'steps.tsx'],
});

export default defineConfig({
  testDir,
  // ...
});
```

#### Create `fixtures.ts`

Export custom `test`:

```ts
import { mergeTests } from '@playwright/test';
import { test as ctBase } from '@playwright/experimental-ct-react';
import { test as base } from 'playwright-bdd';

export const test = mergeTests(base, ctBase);
```

#### Define steps in `steps.tsx`

```ts
import React from 'react';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

Given('Mounted input component', async ({ mount }) => {
  await mount(<textarea data-testid="textField" />);
});

When('I type {string}', async ({ page }, arg: string) => {
  await page.getByTestId('textField').fill(arg);
});

Then('input field has {string}', async ({ page }, arg: string) => {
  await expect(page.getByTestId('textField')).toHaveValue(arg);
});
```

#### Create feature file `input.feature`

```gherkin
Feature: input component

    Scenario: Mount component and interact with it
        Given Mounted input component
        When I type "ABC"
        Then input field has "ABC"
```

#### Update `test-ct` command in `package.json`

Run `bddgen` before running Playwright:

```json
"scripts": {
  "test-ct": "npx bddgen -c playwright-ct.config.ts && playwright test -c playwright-ct.config.ts"
},
```

#### Run tests

```
npm run test-ct
```