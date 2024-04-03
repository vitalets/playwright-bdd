# Special tags

There are some special tags to imporve your testing experience.

## @only
Use `@only` tag to run a single feature / scenario:
```gherkin
@only
Feature: Playwright site
    
    @only
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @skip / @fixme
Use `@skip` (or `@fixme`) tag to skip a particular feature / scenario:
```gherkin
@skip
Feature: Playwright site

    @skip
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

To conditionally skip scenario use [$test and $tags fixtures](writing-steps/playwright-style.md#accessing-test-and-testinfo).
