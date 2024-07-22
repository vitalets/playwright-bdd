# Special tags

There are some special tags to improve your testing experience.

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

## @fail
Use `@fail` tag to mark feature / scenario as [failing](https://playwright.dev/docs/api/class-test#test-fail):
```gherkin
Feature: Playwright site
    
    @fail
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @slow
Use `@slow` tag to mark feature / scenario as [slow](https://playwright.dev/docs/api/class-test#test-slow) (timeout x 3):
```gherkin
Feature: Playwright site
    
    @slow
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @timeout:N
Use `@timeout:N` tag to set scenario timeout:
```gherkin
Feature: Playwright site
    
    @timeout:5000
    Scenario: Check title
        Given I open url "https://playwright.dev"
```
If defined on a feature level, it sets timeout for **each scenario** inside, not for the feature itself. See [`test.describe.configure`](https://playwright.dev/docs/api/class-test#test-describe-configure) for details. Example:
```gherkin
@timeout:5000
Feature: Playwright site
    
    Scenario: Check title
        Given I open url "https://playwright.dev"

    Scenario: Check navigation
        Given I open url "https://playwright.dev"     
```

## @retries:N
Use `@retries:N` tag to set retries for all scenarios in a feature:
```gherkin
@retries:2
Feature: Playwright site
    
    Scenario: Check title
        Given I open url "https://playwright.dev"
```
Or set retries for a single scenario:
```gherkin
Feature: Playwright site
    
    @retries:2
    Scenario: Check title
        Given I open url "https://playwright.dev"
```
> When `@retries` tag is applied to a single scenario, generated test is wrapped into *anonymous describe*, see [microsoft/playwright#10825](https://github.com/microsoft/playwright/issues/10825)

## @mode:xxx
Use one of the following tags to set [execution mode](https://playwright.dev/docs/test-parallel#parallelize-tests-in-a-single-file) for the feature or scenario outline:

* `@mode:parallel`
* `@mode:serial`
* `@mode:default`

Example:

```gherkin
@mode:parallel
Feature: Playwright site
    
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

!> Please note that `@mode` tag is not applicable to a single scenario