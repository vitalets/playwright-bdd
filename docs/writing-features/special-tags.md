# Special tags

There are some special tags to improve your testing experience.

## @only
Use the `@only` tag to run a single feature or scenario:
```gherkin
@only
Feature: Playwright site
    
    @only
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @skip / @fixme
Use the `@skip` (or `@fixme`) tag to skip a particular feature or scenario:
```gherkin
@skip
Feature: Playwright site

    @skip
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

To conditionally skip a scenario, use [$test and $tags fixtures](writing-steps/bdd-fixtures.md#test-and-testinfo).

## @fail
Use the `@fail` tag to mark a feature or scenario as [failing](https://playwright.dev/docs/api/class-test#test-fail):
```gherkin
Feature: Playwright site
    
    @fail
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @slow
Use the `@slow` tag to mark a feature or scenario as [slow](https://playwright.dev/docs/api/class-test#test-slow) (timeout x 3):
```gherkin
Feature: Playwright site
    
    @slow
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @timeout:N
Use the `@timeout:N` tag to set a scenario timeout:
```gherkin
Feature: Playwright site
    
    @timeout:5000
    Scenario: Check title
        Given I open url "https://playwright.dev"
```
If defined on a feature level, it sets the timeout for **each scenario** inside, not for the feature itself. See [`test.describe.configure`](https://playwright.dev/docs/api/class-test#test-describe-configure) for details. Example:
```gherkin
@timeout:5000
Feature: Playwright site
    
    Scenario: Check title
        Given I open url "https://playwright.dev"

    Scenario: Check navigation
        Given I open url "https://playwright.dev"     
```

## @retries:N
Use the `@retries:N` tag to set retries for all scenarios in a feature:
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
> When the `@retries` tag is applied to a single scenario, the generated test is wrapped into an *anonymous describe*, see [microsoft/playwright#10825](https://github.com/microsoft/playwright/issues/10825)

## @mode:xxx
Use one of the following tags to set the [execution mode](https://playwright.dev/docs/test-parallel#parallelize-tests-in-a-single-file) for the feature or scenario outline:

* `@mode:parallel`
* `@mode:serial`
* `@mode:default`

Example:

```gherkin
@mode:parallel
Feature: Playwright site
    
    Scenario: Scenario 1
        Given I open url "https://playwright.dev"

    Scenario: Scenario 2
        Given I open url "https://playwright.dev"        
```

Both `Scenario 1` and `Scenario 2` will be executted in parallel in separate workers.

When using `@mode:serial`, you can check [Passing data between scenarios](writing-steps/passing-data-between-scenarios.md).

!> Please note that the `@mode` tag is not applicable to a single scenario

## @lock:name

Use `@lock:name` when scenarios share a resource that is not tied to a particular step definition:

```gherkin
Feature: Records

    @lock:records-list
    Scenario: Add record
        When the user clicks the "Add Record" button
        Then the "Records" table shows one more row

    @lock:records-list
    Scenario: Delete record
        When the user clicks the "Delete" button
        Then the "Records" table shows one fewer row
```

Each generated test inherits its enclosing lock tags and combines them with [step-definition locks](writing-steps/test-locks.md), removing duplicates. Use multiple tags for multiple resources: `@lock:records-list @lock:audit-log`.

The prefix must be exactly `@lock:` and the name must be nonempty. Names are case-sensitive, static strings without whitespace; commas do not split names. Lock tags remain available for tag filtering and in test metadata. Tags from paths work wherever the filesystem permits `:` in names.

Requires **Playwright 1.63 or later**. Playwright schedules tests sharing a lock across files, workers, and projects within one test run. Its native scheduling scope applies: in default and serial modes, a lock may be held for the whole file. Scenarios skipped during generation omit locks and lock-tag validation; potential runtime skips retain locks.
