# Write your first BDD test

Follow the steps below to create and run your first BDD test with `playwright-bdd`.

?> This guide uses JavaScript for simplicity, but you can use TypeScript as well.

### Step 1: create configuration file

Create the following `playwright.config.js` in the project root:

```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'sample.feature',
  steps: 'steps.js',
});

export default defineConfig({
  testDir,
  reporter: 'html',
});
```

### Step 2: create feature file

Create a feature file named `sample.feature`:

```gherkin
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```

### Step 3: implement steps

Implement the steps in `steps.js`:

```ts
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I open url {string}', async ({ page }, url) => {
  await page.goto(url);
});

When('I click link {string}', async ({ page }, name) => {
  await page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async ({ page }, keyword) => {
  await expect(page).toHaveTitle(new RegExp(keyword));
});
```

> There are alternative ways of defining steps: [Decorators](writing-steps/decorators.md) and [Cucumber-style syntax](writing-steps/cucumber-style.md).

### Step 4: generate and run tests

Generate and run the tests:

```
npx bddgen && npx playwright test
```

Output:

```
Running 1 test using 1 worker
1 passed (2.0s)

To open the last HTML report, run:

npx playwright show-report
```

<details>
  <summary>HTML report</summary>
  <img width="80%" src="https://github.com/vitalets/playwright-bdd/assets/1473072/e327d97c-bc67-4ba2-8660-650f1c479c62"/>
</details>

### Step 5: check generated tests (optional)

Check out the `.features-gen` directory to see what the generated tests look like.

?> Here is a fully working Playwright-BDD example project: [playwright-bdd-example](https://github.com/vitalets/playwright-bdd-example).

> Don't forget to [git-ignore generated files](guides/ignore-generated-files.md).

!> If your project uses [ES Modules](https://nodejs.org/api/esm.html), please check out [ESM configuration](configuration/esm.md).


