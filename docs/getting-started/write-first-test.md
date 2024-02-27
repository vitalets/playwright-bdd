# Write first BDD test

Follow the steps below to create and run first BDD test with `playwright-bdd`.

?> In this guide we use JavaScript for simplicity, but you can use TypeScript as well

1. Create the following `playwright.config.js` in the project root:
   ```js
   import { defineConfig } from '@playwright/test';
   import { defineBddConfig } from 'playwright-bdd';

   const testDir = defineBddConfig({
     paths: ['sample.feature'],
     require: ['steps.js'],
   });

   export default defineConfig({
     testDir,
     reporter: 'html',
   });
   ```

2. Create feature file `sample.feature`:

   ```gherkin
   Feature: Playwright site

       Scenario: Check title
           Given I open url "https://playwright.dev"
           When I click link "Get started"
           Then I see in title "Playwright"
   ```

3. Implement steps in `steps.js`:
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

   > There are alternative ways of defining steps: [Decorators](./decorators.md) and [Cucumber-style syntax](./writing-steps.md#cucumber-style)

4. Generate and run tests:

   ```
   npx bddgen && npx playwright test
   ```

   Output:

   ```
   Running 1 test using 1 worker
   1 passed (2.0s)

   To open last HTML report run:

   npx playwright show-report
   ```
   <details>
     <summary>HTML report</summary>
     <img width="80%" src="https://github.com/vitalets/playwright-bdd/assets/1473072/e327d97c-bc67-4ba2-8660-650f1c479c62"/>
   </details>

5. (Optional) Check out `.features-gen` directory to see what generated tests look like ;)

> Don't forget to [git-ignore generated files](./recipes.md#ignoring-generated-files)

!> If your project runs as [ES Module](https://nodejs.org/api/esm.html), please check out [ESM configuration](./configuration/esm.md)

?> You can also get pre-configured Playwright-bdd project by clonning [playwright-bdd-example](https://github.com/vitalets/playwright-bdd-example)
