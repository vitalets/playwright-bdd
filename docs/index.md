<!-- this file differs from README.md in project root -->

# playwright-bdd

Run [BDD](https://cucumber.io/docs/bdd/) tests with [Playwright](https://playwright.dev/) runner.

> 🔥 **Playwright-bdd v7 is released!** Dropped Cucumber package dependency, simpler configuration and other improvements. [Try it out](https://vitalets.github.io/playwright-bdd/#/guides/migration-v7) and share the feedback!

## Quick start
Jump to [getting started](getting-started/index.md) or read below about `playwright-bdd` architecture.

## Why Playwright runner?
Both [Playwright](https://playwright.dev/) and [CucumberJS](https://github.com/cucumber/cucumber-js) have their own test runners. 
You can use CucumberJS runner with [Playwright as a library](https://medium.com/@manabie/how-to-use-playwright-in-cucumberjs-f8ee5b89bccc) to test BDD scenarios.
This package offers **alternative way**: convert BDD scenarios into Playwright tests and run them with Playwright runner as usual. 
Such approach brings all the benefits of Playwright runner:

* Automatic browser initialization and cleanup
* Auto-capture of screenshots, videos and traces
* Parallelization with sharding
* Auto-waiting of page elements
* Out-of-box visual comparison testing
* Power of Playwright fixtures
* [...a lot more](https://playwright.dev/docs/library#key-differences)

## How playwright-bdd works
Typical command to run tests with `playwright-bdd` is the following:
```
npx bddgen && npx playwright test
```

### Phase 1: Generate tests
CLI command `npx bddgen` generates intermediate test files from BDD feature files. For example:

From
```gherkin
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```

To
```js
import { test } from 'playwright-bdd';

test.describe('Playwright site', () => {

  test('Check title', async ({ Given, When, Then }) => {
    await Given('I open url "https://playwright.dev"');
    await When('I click link "Get started"');
    await Then('I see in title "Playwright"');
  });

});    
```

### Phase 2: Run tests
CLI command `npx playwright test` runs generated test files with Playwright runner.
Playwright-bdd makes Playwright API available in step definitions (`page`, `browser`, etc):

```js
Given('I open url {string}', async ({ page }, url) => {
  await page.goto(url);
});

When('I click link {string}', async ({ page }, name) => {
  await page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async ({ page }, text) => {
  await expect(page).toHaveTitle(new RegExp(text));
});  
```

To try it in action proceed to [installation guide](getting-started/installation.md).