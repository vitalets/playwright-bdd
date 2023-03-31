# playwright-bdd

BDD Testing with [Playwright](https://playwright.dev/) and [Cucumber-js](https://github.com/cucumber/cucumber-js).

## Installation

Install from npm:

```
npm i -D playwright-bdd
```

This package uses `@playwright/test` and `@cucumber/cucumber` as peer dependencies, so you may need to install them as well:

```
npm i -D @playwright/test @cucumber/cucumber
```

After installing Playwright you may need to [install browsers](https://playwright.dev/docs/browsers):

```
npx playwright install
```

## Usage

1. Write human-readable BDD tests in [Gherkin](https://docs.cucumber.io/docs/gherkin/reference/) and store them in `features/*.feature` files:

   ```gherkin
   Feature: Playwright site

       Scenario: Check title
           Given I open url "https://playwright.dev"
           When I click link "Get started"
           Then I see in title "Playwright"
   ```

2. Write step definitions in JavaScript and store them in `features/steps/*.{ts,js}` files:

   ```ts
   import { expect } from '@playwright/test';
   import { Given, When, Then } from '@cucumber/cucumber';
   import { World } from 'playwright-bdd';

   Given('I open url {string}', async function (this: World, url: string) {
     await this.page.goto(url);
   });

   When('I click link {string}', async function (this: World, name: string) {
     await this.page.getByRole('link', { name }).click();
   });

   Then(
     'I see in title {string}',
     async function (this: World, keyword: string) {
       await expect(this.page).toHaveTitle(new RegExp(keyword));
     }
   );
   ```

3. Create Cucumber [configuration](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md) file `cucumber.cjs`:

   ```js
   module.exports = {
     default: {
       require: ['features/steps/**'],
       // uncomment if using typescript
       // requireModule: ['ts-node/register'],
     },
   };
   ```

   Or in ESM format `cucumber.mjs`:

   ```js
   export default {
     import: ['features/steps/**'],
     // uncomment if using typescript
     // requireModule: ['ts-node/register'],
   };
   ```

4. Create Playwright [configuration](https://playwright.dev/docs/test-configuration) file `playwright.config.ts`. Set `testDir` pointing to `.features-gen` directory. That directory does not exist yet but will be created during tests generation:

   ```ts
   import { defineConfig, devices } from '@playwright/test';

   export default defineConfig({
     testDir: '.features-gen', // <- generated BDD tests
     projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
   });
   ```

5. Run tests:

```
npx bddgen && playwright test
```

Depending there are several examples:

- ESM + TypeScript
- CJS + TypeScript
- ESM
- CJS

## License

MIT

```

```
