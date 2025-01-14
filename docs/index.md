<!-- this file differs from README.md in project root -->

<div align="center">
  <a href="/">
    <img width="128" alt="Playwright-BDD" src="logo.svg">
  </a>
</div>

<h1 align="center">Playwright-BDD</h1>

<div align="center">

Run [BDD](https://cucumber.io/docs/bdd/) tests with [Playwright](https://playwright.dev/) runner

</div>

## Quick start
Jump to the [getting started](getting-started/index.md) guide or read below the overview of Playwright-BDD project.

<!-- Keep absolute urls to easily update from README.md -->
## Why BDD?
In the era of AI, you can bring the [BDD](https://cucumber.io/docs/bdd/) approach to the next level:

- 🤖 **Generate**: Drop business requirements to AI chat and get structured, human-readable features.
- ✅ **Validate**: Refine the generated scenarios with AI or colleagues, collaborate in plain text instead of code.
- 🛠 **Automate**: [Use existing steps](https://vitalets.github.io/playwright-bdd/#/writing-features/chatgpt) to run the tests and prevent codebase growth.

## Why Playwright Runner?

Both [Playwright](https://playwright.dev/) and [CucumberJS](https://github.com/cucumber/cucumber-js) have their own test runners. You can use the CucumberJS runner with [Playwright as a library](https://playwright.dev/docs/library) to execute BDD scenarios. This package offers **an alternative**: convert BDD scenarios into test files and run them directly with Playwright. You gain all the advantages of the Playwright runner:

- Automatic browser initialization and cleanup
- Auto-capture of screenshots, videos, and traces
- Parallelization with sharding
- Auto-waiting for page elements
- Built-in visual comparison testing
- Power of Playwright fixtures
- [...and more](https://playwright.dev/docs/library#key-differences)

<!-- Keep absolute urls to easily update from README.md -->
## Extras
Playwright-BDD extends Playwright with BDD capabilities, offering:

- 🔥 Advanced tagging [by path](https://vitalets.github.io/playwright-bdd/#/writing-features/tags-from-path) and [special tags](https://vitalets.github.io/playwright-bdd/#/writing-features/special-tags)
- 🎩 [Step decorators](https://vitalets.github.io/playwright-bdd/#/writing-steps/decorators) for class methods  
- 🎯 [Scoped step definitions](https://vitalets.github.io/playwright-bdd/#/writing-steps/scoped)  
- ✨ [Exporting steps](https://vitalets.github.io/playwright-bdd/#/writing-features/chatgpt) for AI  
- ♻️ [Re-usable step functions](https://vitalets.github.io/playwright-bdd/#/writing-steps/reusing-step-fn)  

## How Playwright-BDD works
A typical command to run tests with Playwright-BDD is:
```
npx bddgen && npx playwright test
```

### Phase 1: Generate tests
The first command `npx bddgen` generates test files from BDD feature files. For example:

From
```gherkin
Feature: Playwright Home Page

    Scenario: Check title
        Given I am on Playwright home page
        When I click link "Get started"
        Then I see in title "Installation"
```

To
```js
import { test } from 'playwright-bdd';

test.describe('Playwright Home Page', () => {

  test('Check title', async ({ Given, When, Then }) => {
    await Given('I am on Playwright home page');
    await When('I click link "Get started"');
    await Then('I see in title "Installation"');
  });

});
```

### Phase 2: Run tests
The second command `npx playwright test` runs the generated files with the Playwright runner.
Step definitions have access to the Playwright APIs and fixtures (e.g. `page`):

```js
Given('I am on Playwright home page', async ({ page }) => {
  await page.goto('https://playwright.dev');
});

When('I click link {string}', async ({ page }, name) => {
  await page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async ({ page }, text) => {
  await expect(page).toHaveTitle(new RegExp(text));
});  
```

HTML report shows all scenarios and steps:

![Playwright html report](reporters/_media/pw-html-report.png)

Proceed to the [installation guide](getting-started/installation.md) and try it yourself.