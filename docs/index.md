<!-- this file differs from README.md in project root -->

# playwright-bdd

Run [BDD](https://cucumber.io/docs/bdd/) tests with [Playwright](https://playwright.dev/) runner.

> Inspired by the issue in Playwright repo [microsoft/playwright#11975](https://github.com/microsoft/playwright/issues/11975)

> 🔥 Check out new [decorators syntax](decorators.md) to define BDD steps right inside Page Object Models

## Quick start
Jump to [installation guide](installation.md) or continue reading to learn more about `playwright-bdd` architecture.

## Why Playwright runner
Both [Playwright](https://playwright.dev/) and [CucumberJS](https://github.com/cucumber/cucumber-js) have their own test runners. 
You can use CucumberJS runner with [Playwright as a library](https://medium.com/@manabie/how-to-use-playwright-in-cucumberjs-f8ee5b89bccc) to test BDD scenarios.
This package offers **alternative way**: convert BDD scenarios into Playwright tests and run them with Playwright runner as usual. 
Such approach brings all the benefits of Playwright runner:

* Automatic browser initialization and cleanup
* Power of [Playwright fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures)
* Out-of-box [screenshot testing](https://playwright.dev/docs/test-snapshots)
* Parallelization with [sharding](https://timdeschryver.dev/blog/using-playwright-test-shards-in-combination-with-a-job-matrix-to-improve-your-ci-speed#after)
* [...a lot more](https://playwright.dev/docs/library#key-differences)

## How playwright-bdd works
Typical command to run tests with `playwright-bdd` is following:
```
npx bddgen && npx playwright test
```

### Phase 1: Generate 
CLI command `npx bddgen` generates test files from BDD feature files. For example:

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

### Phase 2: Run
CLI commmand `npx playwright test` runs generated test files with Playwright runner.
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

To try it in action proceed to [installation guide](installation.md).