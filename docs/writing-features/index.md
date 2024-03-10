# Writing features
Write features in `*.feature` files using [Gherkin syntax](https://cucumber.io/docs/gherkin/reference/#keywords). All keywords are supported.

Example `sample.feature`:

```gherkin
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```

## Tags
[Cucumber tags](https://cucumber.io/docs/cucumber/api/?lang=javascript#tags) are fully supported. For example:
```gherkin
@desktop
Feature: Playwright site

    @slow @jira:123
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

After adding tags to your scenarios you can generate and run subset of tests using `--tags` option with [tags expression](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions):
```
npx bddgen --tags "@desktop and not @slow" && npx playwright test
```
Also you can [access tags inside step definitions](writing-steps/playwright-style.md#using-tags).

## Run single feature
Use `@only` tag to run a single feature / scenario:
```gherkin
@only
Feature: Playwright site
    
    @only
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## Skip single feature
Use `@skip` (or `@fixme`) tag to skip a particular feature / scenario:
```gherkin
@skip
Feature: Playwright site

    @skip
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

To conditionally skip scenario use [$test and $tags fixtures](writing-steps/playwright-style.md#accessing-test-and-testinfo).

