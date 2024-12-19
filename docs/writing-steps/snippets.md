# Snippets

Snippets allow you to quickly create definitions for missing steps.

Example:

Imagine you've added a new feature file:
```gherkin
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```
And executed it without defining its steps implementation:
```
npx bddgen && npx playwright test
```
The output shows an error and provides code snippets that you can copy-paste to your codebase:
```
Missing step definitions: 3

Given('I open url {string}', async ({}, arg) => {
  // Step: Given I open url "https://playwright.dev"
  // From: features/homepage.feature:4:5
});

When('I click link {string}', async ({}, arg) => {
  // Step: When I click link "Get started"
  // From: features/homepage.feature:5:5
});

Then('I see in title {string}', async ({}, arg) => {
  // Step: Then I see in title "Playwright"
  // From: features/homepage.feature:6:5
});

Use the snippets above to create missing steps.
```

> In some projects, features are written beforehand and step definitions come later. For such cases, you may need to allow the generation of test files with missing steps and have them reported as failing (or fixme) scenarios. Check out the [`missingSteps`](configuration/options.md#missingsteps) option to configure that behavior.